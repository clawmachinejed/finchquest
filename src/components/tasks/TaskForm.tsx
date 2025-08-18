// src/components/tasks/TaskForm.tsx
'use client'
import * as React from "react";
import { useState } from 'react'

import type { Status } from '@/lib/types'

const STATUS: Status[] = ['todo', 'doing', 'done', 'blocked']

export default function TaskForm(props: {
  onCreate: (input: {
    title: string
    notes?: string
    status?: Status
    dueDate?: Date | null
    priority?: string
  }) => Promise<void>
  disabled?: boolean
}) {
  const { onCreate, disabled } = props
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<Status>('todo')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await onCreate({
      title,
      notes: notes || undefined,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || undefined,
    })
    setTitle(''); setNotes(''); setStatus('todo'); setDueDate(''); setPriority('')
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">New Task</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          className="w-full rounded-xl border px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
        >
          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          className="w-full rounded-xl border px-3 py-2 sm:col-span-2"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <input
          type="date"
          className="w-full rounded-xl border px-3 py-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Priority (optional)"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />
      </div>
      <button type="submit" disabled={disabled} className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50">
        Add Task
      </button>
    </form>
  )
}
