// src/app/(app)/tasks/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore'

import Protected from '@/components/auth/Protected'
import TaskCreateModal from '@/components/modals/TaskCreateModal'
import TaskEditModal from '@/components/modals/TaskEditModal'
import useAuth from '@/app/providers/AuthProvider'
import { getDb } from '@/lib/firebase.client'

type Quest = { id: string; title: string; summary?: string; domainId?: string }
type Chapter = { id: string; title: string; summary?: string; questId?: string }
type Task = {
  id: string
  title: string
  notes?: string
  status?: 'todo' | 'doing' | 'done' | 'blocked'
  priority?: 'low' | 'medium' | 'high'
  chapterId: string
  userId: string
  createdAt?: unknown
  updatedAt?: unknown
  dueDate?: number | null
}

export default function TasksPage() {
  return (
    <Protected>
      <TasksInner />
    </Protected>
  )
}

function TasksInner() {
  const sp = useSearchParams()
  const chapterId = sp.get('chapter') ?? ''
  const questId = sp.get('quest') ?? ''
  const domainId = sp.get('domain') ?? ''
  const router = useRouter()
  const { user } = useAuth()
  const db = getDb()

  const [quest, setQuest] = useState<Quest | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [editId, setEditId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const backToChaptersHref = useMemo(() => {
    const p = new URLSearchParams()
    if (questId) p.set('quest', questId)
    if (domainId) p.set('domain', domainId)
    return `/chapters?${p.toString()}`
  }, [questId, domainId])

  const reload = async () => {
    if (!user || !chapterId) return
    setLoading(true)
    try {
      // Load chapter
      const chRef = doc(db, 'chapters', chapterId)
      const chSnap = await getDoc(chRef)
      if (!chSnap.exists()) {
        router.replace(backToChaptersHref)
        return
      }
      const chd = chSnap.data() as Partial<Chapter>
      setChapter({
        id: chSnap.id,
        title: String(chd.title ?? ''),
        summary: chd.summary,
        questId: chd.questId,
      })

      // Load quest (from param or from chapter)
      const qId = questId || chd.questId || ''
      if (qId) {
        const qRef = doc(db, 'quests', qId)
        const qSnap = await getDoc(qRef)
        if (qSnap.exists()) {
          const qd = qSnap.data() as Partial<Quest>
          setQuest({
            id: qSnap.id,
            title: String(qd.title ?? ''),
            summary: qd.summary,
            domainId: qd.domainId,
          })
        }
      }

      // Load tasks
      const qTasks = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        where('chapterId', '==', chapterId),
        orderBy('createdAt', 'asc')
      )
      const snap = await getDocs(qTasks)
      const rows: Task[] = []
      snap.forEach(d => rows.push({ ...(d.data() as Task), id: d.id }))
      setTasks(rows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chapterId])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      {/* Back link */}
      <div className="mb-4">
        <Link href={backToChaptersHref} className="text-sm text-blue-400 hover:underline">
          ← Back to Chapters
        </Link>
      </div>

      {/* Headers */}
      <h1 className="mb-1 text-2xl font-bold text-white">{quest ? quest.title : '…'}</h1>
      <h2 className="mb-1 text-lg font-semibold text-zinc-200">{chapter ? chapter.title : '…'}</h2>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-300">Tasks</h3>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-sm font-medium text-zinc-100 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-800 active:scale-[0.99]"
        >
          <span className="text-base leading-none">＋</span>
          <span>Add</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 p-6 text-zinc-400">No tasks yet.</div>
      ) : (
        <ul className="space-y-3">
          {tasks.map(t => (
            <li
              key={t.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700"
            >
              <div className="min-w-0">
                <div className="block truncate text-base font-medium text-white" title={t.title}>
                  {t.title}
                </div>
                {t.notes && <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{t.notes}</p>}
                <div className="mt-2 text-xs text-zinc-500">
                  {t.status ? <>Status: {t.status}</> : null}
                  {t.priority ? <>{t.status ? ' · ' : ''}Priority: {t.priority}</> : null}
                </div>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() => {
                    setEditId(t.id)
                    setEditOpen(true)
                  }}
                  className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modals */}
      <TaskEditModal taskId={editId} open={editOpen} onClose={() => setEditOpen(false)} onSaved={reload} />
      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={reload}
        chapterId={chapterId}
        questId={questId || null}
        domainId={domainId || null}
      />
    </div>
  )
}
