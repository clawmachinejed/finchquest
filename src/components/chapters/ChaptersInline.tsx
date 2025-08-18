// src/components/chapters/ChaptersInline.tsx
'use client'
import * as React from "react";
import { useState } from 'react'

import { useChapters } from '@/lib/useChapters'

export default function ChaptersInline(props: {
  userId?: string
  questId: string
  domainId?: string
}) {
  const { userId, questId } = props
  const { items, loading, error, create } = useChapters(userId, questId)

  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string>('')

  async function addChapter(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      setBusy(true)
      setErr('')
      await create({
        title: title.trim(),
        summary: undefined,      // keep hidden/empty for now
        status: 'todo',          // default; not shown in UI
        dueDate: null,           // default; not shown in UI
      })
      setTitle('')
    } catch (e: any) {
      setErr(e.message || 'Failed to add chapter')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 rounded-xl border bg-gray-50/60 p-3">
      {/* Quick add */}
      <form onSubmit={addChapter} className="mb-3 flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2"
          placeholder="New chapter name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="rounded-lg border px-3 py-2 text-sm"
          disabled={!userId || busy || !title.trim()}
        >
          + Chapter
        </button>
      </form>

      {err && <div className="mb-2 text-xs text-red-600">{err}</div>}

      {/* Chapters list (titles only) */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading chapters…</div>
      ) : error ? (
        <div className="text-xs text-red-600">Error: {error}</div>
      ) : items.length === 0 ? (
        <div className="text-xs text-gray-500">No chapters yet.</div>
      ) : (
        <ul className="space-y-1">
          {items.map((c) => (
            <li key={c.id} className="rounded-lg bg-white px-3 py-2 text-sm font-medium">
              {c.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
