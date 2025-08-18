// src/app/(app)/today/page.tsx
'use client'

import Link from 'next/link'

import useAuth from '@/app/providers/AuthProvider'
import { useTasksAll } from '@/lib/useTasksAll'

function isToday(millis: number) {
  const d = new Date(millis)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export default function TodayPage() {
  const { user } = useAuth()
  const { items, loading, error } = useTasksAll(user?.uid)

  const dueToday = items.filter(
    t => t.dueDate != null && isToday(t.dueDate!) && (t.status === 'todo' || t.status === 'doing')
  )
  const overdue = items.filter(
    t => t.dueDate != null && t.dueDate! < new Date().setHours(0, 0, 0, 0) && (t.status === 'todo' || t.status === 'doing')
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Today</h1>

      {loading && <div className="rounded-xl border p-4">Loading…</div>}
      {error && <div className="rounded-xl border p-4 text-red-600">Error: {error}</div>}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Overdue</h2>
        <div className="rounded-xl border">
          {overdue.length === 0 ? (
            <div className="p-4 text-sm opacity-70">Nothing overdue 🎉</div>
          ) : (
            <ul>
              {overdue.map(t => (
                <li key={t.id} className="border-b/10 flex items-center justify-between p-3">
                  <span>{t.title}</span>
                  <Link href={`/tasks?chapter=${t.chapterId}`} className="text-sm underline">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Due Today</h2>
        <div className="rounded-xl border">
          {dueToday.length === 0 ? (
            <div className="p-4 text-sm opacity-70">No tasks due today.</div>
          ) : (
            <ul>
              {dueToday.map(t => (
                <li key={t.id} className="border-b/10 flex items-center justify-between p-3">
                  <span>{t.title}</span>
                  <Link href={`/tasks?chapter=${t.chapterId}`} className="text-sm underline">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
