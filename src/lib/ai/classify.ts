import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/lib/firebase.client';

export type MatchMethod = 'exact' | 'alias' | 'fuzzy' | 'model';

type Candidate = {
  questId: string;
  chapterId?: string | null;
  score: number;
  method: MatchMethod;
};

type QuestLite = { id: string; title: string; domainKey?: string | null };
type ChapterLite = { id: string; title: string; questId: string };

async function loadAliases(uid: string, domainKey: string | null) {
  const key = domainKey || 'global';
  const col = collection(db, 'users', uid, 'aliases', key, 'entries');
  const snaps = await getDocs(col);
  return snaps.docs.map((d) => d.data() as { alias: string; questId: string; chapterId?: string | null; weight?: number });
}

function toTokens(s: string) {
  return (s || '')
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);
}

/**
 * Simple token-overlap similarity in [0,1]
 */
function tokenSim(a: string, b: string) {
  const A = new Set(toTokens(a));
  const B = new Set(toTokens(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  A.forEach((t) => {
    if (B.has(t)) inter++;
  });
  return inter / Math.max(A.size, B.size);
}

/**
 * Classify a meeting to Quest/Chapter with confidences using:
 * 1) exact → 2) alias → 3) fuzzy → 4) model (stub)
 *
 * Pass in the user's quests/chapters (already filtered by userId).
 * domainHint is optional; when present, alias lookup is scoped there first, then 'global'.
 */
export async function classifyMeeting(input: {
  uid: string;
  domainHint?: string | null;
  title: string;
  transcript?: string | null;
  quests: QuestLite[];
  chapters: ChapterLite[];
}): Promise<Candidate> {
  const { uid, domainHint, title, transcript, quests, chapters } = input;

  const t = (title || '').trim().toLowerCase();

  // 1) exact matches
  const exactQ = quests.find((q) => (q.title || '').toLowerCase() === t);
  if (exactQ) return { questId: exactQ.id, score: 0.9, method: 'exact' };

  const exactC = chapters.find((c) => (c.title || '').toLowerCase() === t);
  if (exactC) return { questId: exactC.questId, chapterId: exactC.id, score: 0.95, method: 'exact' };

  // 2) aliases (domain-scoped then global)
  const scopedAliases = await loadAliases(uid, domainHint ?? null);
  const globalAliases = await loadAliases(uid, 'global');
  const allAliases = [...scopedAliases, ...globalAliases];
  const aliasHit = allAliases.find((a) => a.alias === t);
  if (aliasHit) {
    return {
      questId: aliasHit.questId,
      chapterId: aliasHit.chapterId ?? null,
      score: 0.88,
      method: 'alias',
    };
  }

  // 3) fuzzy (token overlap over title + optional transcript)
  const haystack = `${title} ${transcript || ''}`;
  let best: Candidate = { questId: '', chapterId: null, score: 0, method: 'fuzzy' };

  for (const q of quests) {
    const s = tokenSim(haystack, q.title || '');
    if (s > best.score) best = { questId: q.id, chapterId: null, score: s, method: 'fuzzy' };
  }
  for (const c of chapters) {
    const s = tokenSim(haystack, c.title || '');
    if (s > best.score) best = { questId: c.questId, chapterId: c.id, score: s, method: 'fuzzy' };
  }

  // 4) model (stub): in absence of a real model call, gently lift weak fuzzy up to 0.5
  const modelCandidate: Candidate = {
    questId: best.questId,
    chapterId: best.chapterId ?? null,
    score: Math.max(best.score, 0.5),
    method: 'model',
  };

  // Pick the stronger of fuzzy vs model stub
  return best.score >= modelCandidate.score ? best : modelCandidate;
}
