'use client'
import * as React from "react";
import { useState } from 'react'

import TasksInline from '@/components/tasks/TasksInline'
import type { Chapter, Status } from '@/lib/types'

export default function ChapterList(props: {
  chapters: Chapter[]
  onUpdate: (id: string, patch: Partial<Pick<Chapter, 'title'|'summary'|'status'>> & { dueDate?: Date | null }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  questId: string
  domainId?: string
  userId?: string
}) {
  const { chapters, onUpdate, onDelete, questId, domainId, userId } = props

  return (
    <ul className="space-y-3">
      {chapters.map((c) => (
        <li key={c.id} className="rounded border p-3">
          {/* Header row: chapter title + actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-base font-semibold">{c.title}</div>
            <InlineActions chapter={c} onUpdate={onUpdate} onDelete={onDelete} />
          </div>

          {/* Inline tasks (titles only + quick add) */}
          <TasksInline
            userId={userId}
            chapterId={c.id}
            questId={questId}
            domainId={domainId}
          />
        </li>
      ))}
      {chapters.length === 0 && (
        <li className="rounded border p-6 text-center text-sm text-gray-500">
          No chapters yet.
        </li>
      )}
    </ul>
  )
}

function InlineActions(props: {
  chapter: Chapter
  onUpdate: (id: string, patch: Partial<Pick<Chapter, 'title'|'summary'|'status'>> & { dueDate?: Date | null }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const { chapter, onUpdate, onDelete } = props
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(chapter.title)
  const [summary, setSummary] = useState(chapter.summary)
  const [status, setStatus] = useState<Status>(chapter.status)
  const [dueDate, setDueDate] = useState<string>(
    chapter.dueDate ? new Date(chapter.dueDate).toISOString().slice(0, 10) : ''
  )

  async function save() {
    await onUpdate(chapter.id, {
      title,
      summary,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
    })
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <button className="rounded-xl border px-3 py-1" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button
          className="rounded-xl border px-3 py-1 text-red-600"
          onClick={() => onDelete(chapter.id)}
        >
          Delete
        </button>
      </div>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        className="rounded-xl border px-2 py-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="rounded-xl border px-2 py-1"
        placeholder="Summary (optional)"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <select
        className="rounded-xl border px-2 py-1"
        value={status}
        onChange={(e) => setStatus(e.target.value as Status)}
      >
        {['todo', 'doing', 'done', 'blocked'].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        type="date"
        className="rounded-xl border px-2 py-1"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <div className="flex gap-2">
        <button className="rounded-xl bg-black px-3 py-1 text-white" onClick={save}>
          Save
        </button>
        <button className="rounded-xl border px-3 py-1" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}
