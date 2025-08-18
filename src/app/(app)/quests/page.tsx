// src/app/(app)/quests/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import Protected from '@/components/auth/Protected';
import { useAuth } from '@/app/providers/AuthProvider';
import QuestEditModal from '@/components/modals/QuestEditModal';
import QuestCreateModal from '@/components/modals/QuestCreateModal';
import DomainFilterBar from '@/components/filters/DomainFilterBar';
import type { Quest, Chapter } from '@/types/models';

// simple date formatter (accepts Firestore Timestamp or Date/string)
const fmtDate = (v: any) => {
  if (!v) return null;
  try {
    const d: Date = (v as any).toDate ? (v as any).toDate() : new Date(v as any);
    return d.toLocaleDateString();
  } catch {
    return null;
  }
};

export default function QuestsPage() {
  return (
    <Protected>
      <QuestsInner />
    </Protected>
  );
}

function QuestsInner() {
  const sp = useSearchParams();
  const { user } = useAuth();

  const selectedDomains = useMemo<string[]>(() => {
    const many = sp.getAll('domain').filter(Boolean);
    if (many.length) return dedupe(many);
    const csv = sp.get('domain');
    if (!csv) return [];
    return dedupe(csv.split(',').filter(Boolean));
  }, [sp]);

  const [quests, setQuests] = useState<Quest[]>([]);
  const [chaptersByQuest, setChaptersByQuest] = useState<Record<string, Chapter[]>>({});
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const reload = async () => {
    if (!user) return;
    setLoading(true);

    let questsRows: Quest[] = [];

    const base: QueryConstraint[] = [orderBy('createdAt', 'asc')];

    if (selectedDomains.length === 0) {
      const qRef = query(collection(db, 'quests'), where('userId', '==', user.uid), ...base);
      const snap = await getDocs(qRef);
      snap.forEach((d) => questsRows.push({ id: d.id, ...(d.data() as any) }));
    } else if (selectedDomains.length === 1) {
      const qRef = query(
        collection(db, 'quests'),
        where('userId', '==', user.uid),
        where('domainId', '==', selectedDomains[0]),
        ...base
      );
      const snap = await getDocs(qRef);
      snap.forEach((d) => questsRows.push({ id: d.id, ...(d.data() as any) }));
    } else {
      const snaps = await Promise.all(
        selectedDomains.map((dom) =>
          getDocs(
            query(
              collection(db, 'quests'),
              where('userId', '==', user.uid),
              where('domainId', '==', dom),
              ...base
            )
          )
        )
      );
      questsRows = dedupeById(
        snaps.flatMap((s) => s.docs.map((d) => ({ id: d.id, ...(d.data() as any) })))
      );
      questsRows.sort((a, b) => ts((a as any).createdAt) - ts((b as any).createdAt));
    }

    setQuests(questsRows);

    const map: Record<string, Chapter[]> = {};
    for (const quest of questsRows) {
      const cq = query(
        collection(db, 'chapters'),
        where('userId', '==', user.uid),
        where('questId', '==', quest.id),
        orderBy('createdAt', 'asc')
      );
      const csnap = await getDocs(cq);
      const rows: Chapter[] = [];
      csnap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      map[quest.id] = rows;
    }
    setChaptersByQuest(map);

    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedDomains.join('|')]);

  const tasksHref = (questId: string, chapterId: string) => {
    const p = new URLSearchParams();
    p.set('chapter', chapterId);
    p.set('quest', questId);
    if (selectedDomains.length === 1) {
      p.set('domain', selectedDomains[0]!);
    }
    return `/tasks?${p.toString()}`;
  };

  const headingNote =
    selectedDomains.length === 0
      ? 'Showing all quests'
      : `Filtered: ${selectedDomains.join(', ')}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Quests</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-sm font-medium text-zinc-100 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-800 active:scale-[0.99]"
            aria-label="Add quest"
          >
            <span className="text-base leading-none">＋</span>
            <span>Add</span>
          </button>
        </div>
      </div>
      <p className="mb-3 text-sm text-zinc-400">{headingNote}</p>

      <DomainFilterBar />

      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : quests.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 p-6 text-zinc-400">No quests yet.</div>
      ) : (
        <ul className="space-y-3">
          {quests.map((qst) => (
            <li
              key={qst.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/chapters?${new URLSearchParams({
                      quest: qst.id,
                      ...(selectedDomains.length === 1 ? { domain: selectedDomains[0] } : {}),
                    }).toString()}`}
                    className="block truncate text-base font-medium text-white hover:underline"
                    title={qst.title}
                  >
                    {qst.title}
                  </Link>
                  {/* summary/status/priority/due shown if present on the doc */}
                  {(qst as any).summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{(qst as any).summary}</p>
                  )}
                  <div className="mt-2 text-xs text-zinc-500">
                    {(qst as any).status ? <>Status: {(qst as any).status}</> : null}
                    {(qst as any).priority ? <>{(qst as any).status ? ' · ' : ''}Priority: {(qst as any).priority}</> : null}
                    {fmtDate((qst as any).dueDate) ? (
                      <>
                        {((qst as any).status || (qst as any).priority) ? ' · ' : ''}Due: {fmtDate((qst as any).dueDate)}
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => {
                      setEditId(qst.id);
                      setEditOpen(true);
                    }}
                    className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="mt-3">
                {(chaptersByQuest[qst.id] ?? []).length ? (
                  <ul className="space-y-1">
                    {(chaptersByQuest[qst.id] ?? []).map((ch) => (
                      <li key={ch.id} className="flex items-center justify-between pl-3">
                        <Link
                          href={tasksHref(qst.id, ch.id)}
                          className="truncate text-sm text-zinc-300 hover:underline"
                          title={ch.title}
                        >
                          • {ch.title}
                        </Link>
                        <span className="ml-3 shrink-0 text-xs text-zinc-500">
                          {(ch as any).status || ''}
                          {(ch as any).priority ? ((ch as any).status ? ' · ' : '') + `prio: ${(ch as any).priority}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="pl-3 text-sm text-zinc-500">No chapters yet.</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <QuestEditModal
        questId={editId}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={reload}
      />

      <QuestCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={reload}
        defaultDomainId={selectedDomains.length === 1 ? selectedDomains[0] : null}
      />
    </div>
  );
}

/* helpers */
function dedupe<T>(arr: T[]) {
  return Array.from(new Set(arr));
}
function dedupeById<T extends { id: string }>(arr: T[]) {
  const m = new Map<string, T>();
  arr.forEach((i) => m.set(i.id, i));
  return Array.from(m.values());
}
function ts(t: any): number {
  try {
    return typeof t?.toDate === 'function' ? t.toDate().getTime() : 0;
  } catch {
    return 0;
  }
}
