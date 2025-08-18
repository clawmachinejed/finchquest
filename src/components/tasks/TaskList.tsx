// src/components/tasks/TaskList.tsx
'use client'
import * as React from "react";
import { useState } from 'react'

import type { Status } from '@/lib/types'
import type { Task } from '@/lib/useTasks'

export default function TaskList(props: {
  tasks: Task[]
  onUpdate: (id: string, patch: Partial<Pick<Task,'title'|'notes'|'status'|'priority'>> & { dueDate?: Date | null }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const { tasks, onUpdate, onDelete } = props

  return (
    <ul className="divide-y rounded-2xl border">
      {tasks.map((t) => (
        <li key={t.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-semibold">{t.title}</div>
            {t.notes ? <div className="text-sm text-gray-600">{t.notes}</div> : null}
            <div className="mt-1 text-xs text-gray-500">
              <span className="mr-2 rounded-full border px-2 py-0.5">{t.status}</span>
              {t.priority ? <span className="mr-2">Priority: {t.priority}</span> : null}
              {t.dueDate ? <span>Due {new Date(t.dueDate).toLocaleDateString()}</span> : <span>No due date</span>}
            </div>
          </div>
          <InlineEditor task={t} onUpdate={onUpdate} onDelete={onDelete} />
        </li>
      ))}
      {tasks.length === 0 && (
        <li className="p-6 text-center text-sm text-gray-500">No tasks yet.</li>
      )}
    </ul>
  )
}

function InlineEditor(props: {
  task: Task
  onUpdate: (id: string, patch: Partial<Pick<Task,'title'|'notes'|'status'|'priority'>> & { dueDate?: Date | null }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const { task, onUpdate, onDelete } = props
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes ?? '')
  const [status, setStatus] = useState<Status>(task.status)
  const [priority, setPriority] = useState(task.priority ?? '')
  const [dueDate, setDueDate] = useState<string>(task.dueDate ? new Date(task.dueDate).toISOString().slice(0,10) : '')

  async function save() {
    await onUpdate(task.id, {
      title,
      notes,
      status,
      priority: priority || undefined,
      dueDate: dueDate ? new Date(dueDate) : null,
    })
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <button className="rounded-xl border px-3 py-1" onClick={() => setEditing(true)}>Edit</button>
        <button className="rounded-xl border px-3 py-1 text-red-600" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input className="rounded-xl border px-2 py-1" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <input className="rounded-xl border px-2 py-1" placeholder="Notes" value={notes} onChange={(e)=>setNotes(e.target.value)} />
      <select className="rounded-xl border px-2 py-1" value={status} onChange={(e)=>setStatus(e.target.value as Status)}>
        {(['todo','doing','done','blocked'] as Status[]).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <input type="date" className="rounded-xl border px-2 py-1" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
      <input className="rounded-xl border px-2 py-1" placeholder="Priority" value={priority} onChange={(e)=>setPriority(e.target.value)} />
      <div className="flex gap-2">
        <button className="rounded-xl bg-black px-3 py-1 text-white" onClick={save}>Save</button>
        <button className="rounded-xl border px-3 py-1" onClick={()=>setEditing(false)}>Cancel</button>
      </div>
    </div>
  )
}
