// src/app/(app)/chapters/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import type { Task, Chapter, Quest } from '@/types/models';

import Protected from '@/components/auth/Protected';
import { useAuth } from '@/app/providers/AuthProvider';
import { db } from '@/lib/firebase.client';
import ChapterEditModal from '@/components/modals/ChapterEditModal';
import ChapterCreateModal from '@/components/modals/ChapterCreateModal';
import TaskEditModal from '@/components/modals/TaskEditModal';
import TaskCreateModal from '@/components/modals/TaskCreateModal';

// (removed the local `type Quest = { ... }`)

export default function ChaptersPage() {
  return (
    <Protected>
      <ChaptersInner />
    </Protected>
  );
}

function ChaptersInner() {
  const sp = useSearchParams();
  const questId = sp.get('quest') ?? '';
  const domainId = sp.get('domain') ?? '';
  const router = useRouter();
  const { user } = useAuth();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tasksByChapter, setTasksByChapter] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);

  const [editChapterId, setEditChapterId] = useState<string | null>(null);
  const [editChapterOpen, setEditChapterOpen] = useState(false);
  const [createChapterOpen, setCreateChapterOpen] = useState(false);

  const [editTaskId] = useState<string | null>(null);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [createTaskForChapter, setCreateTaskForChapter] = useState<string | null>(null);

  const backToQuestsHref = useMemo(() => {
    const params = new URLSearchParams();
    if (domainId) params.set('domain', domainId);
    return `/quests?${params.toString()}`;
  }, [domainId]);

  const reload = async () => {
    if (!user || !questId) return;
    setLoading(true);
    try {
      const questRef = doc(db, 'quests', questId);
      const questSnap = await getDoc(questRef);
      if (!questSnap.exists()) {
        router.replace(backToQuestsHref);
        return;
      }
      const qd = questSnap.data() as Quest;
      // include all fields from Firestore so required props (e.g., domainId) are present
      setQuest({ id: questSnap.id, ...(qd as any) } as Quest);

      const qCh = query(
        collection(db, 'chapters'),
        where('userId', '==', user.uid),
        where('questId', '==', questId),
        orderBy('createdAt', 'asc'),
      );
      const snap = await getDocs(qCh);
      const chRows: Chapter[] = [];
      snap.forEach((d) => chRows.push({ id: d.id, ...(d.data() as any) }));
      setChapters(chRows);

      const map: Record<string, Task[]> = {};
      for (const ch of chRows) {
        const qTasks = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('chapterId', '==', ch.id),
          orderBy('createdAt', 'asc'),
        );
        const tsnap = await getDocs(qTasks);
        const rows: Task[] = [];
        tsnap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
        map[ch.id] = rows;
      }
      setTasksByChapter(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [user, questId]);

  const tasksHref = (chapterId: string) => {
    const params = new URLSearchParams();
    params.set('chapter', chapterId);
    params.set('quest', questId);
    if (domainId) params.set('domain', domainId);
    return `/tasks?${params.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-4">
        <Link href={backToQuestsHref} className="text-sm text-blue-400 hover:underline">
          ← Back to Quests
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-bold text-white">{quest ? quest.title : '…'}</h1>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">Chapters</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateChapterOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-sm font-medium text-zinc-100 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-800 active:scale-[0.99]"
          >
            <span className="text-base leading-none">＋</span>
            <span>Add</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : chapters.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 p-6 text-zinc-400">No chapters yet.</div>
      ) : (
        <ul className="space-y-3">
          {chapters.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={tasksHref(c.id)}
                    className="block truncate text-base font-medium text-white hover:underline"
                    title={c.title}
                  >
                    {c.title}
                  </Link>

                  {(c as any).summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{(c as any).summary}</p>
                  )}
                  <div className="mt-2 text-xs text-zinc-500">
                    {(c as any).status ? <>Status: {(c as any).status}</> : null}
                    {(c as any).priority ? (
                      <>
                        {(c as any).status ? ' · ' : ''}Priority: {(c as any).priority}
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => {
                      setEditChapterId(c.id);
                      setEditChapterOpen(true);
                    }}
                    className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="mt-3 pl-3">
                {(tasksByChapter[c.id] ?? []).length ? (
                  <ul className="space-y-1">
                    {(tasksByChapter[c.id] ?? []).map((t) => (
                      <li key={t.id} className="flex items-start justify-between">
                        <div className="truncate text-sm text-zinc-300" title={t.title}>
                          • {t.title}
                        </div>
                        <div className="ml-3 shrink-0 text-xs text-zinc-500">
                          {(t as any).status || ''}
                          {(t as any).priority
                            ? ((t as any).status ? ' · ' : '') + `prio: ${(t as any).priority}`
                            : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-zinc-500">No tasks yet.</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ChapterEditModal
        chapterId={editChapterId}
        open={editChapterOpen}
        onClose={() => setEditChapterOpen(false)}
        onSaved={reload}
      />

      <ChapterCreateModal
        open={createChapterOpen}
        onClose={() => setCreateChapterOpen(false)}
        onCreated={reload}
        domainId={domainId}
        questId={questId}
      />

      <TaskEditModal
        taskId={editTaskId}
        open={editTaskOpen}
        onClose={() => setEditTaskOpen(false)}
        onSaved={reload}
      />

      <TaskCreateModal
        open={!!createTaskForChapter}
        onClose={() => setCreateTaskForChapter(null)}
        onCreated={reload}
        chapterId={createTaskForChapter || ''}
        questId={questId}
        domainId={domainId}
      />
    </div>
  );
}
