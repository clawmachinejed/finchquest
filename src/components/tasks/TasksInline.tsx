// src/components/tasks/TasksInline.tsx
'use client';
import * as React from 'react';

import { useState } from 'react';
import { useTasks } from '@/lib/useTasks';

export default function TasksInline(props: {
  userId?: string;
  chapterId: string;
  questId?: string;
  domainId?: string;
}) {
  const { userId, chapterId } = props;
  const { items, loading, error, create } = useTasks(userId, chapterId);

  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>('');

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setBusy(true);
      setErr('');
      await create({
        title: title.trim(),
        notes: undefined, // hidden for now
        status: 'todo', // default
        dueDate: null, // default
        priority: undefined, // default (omitted)
      });
      setTitle('');
    } catch (e: any) {
      setErr(e.message || 'Failed to add task');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border bg-gray-50/60 p-3">
      {/* Quick add */}
      <form onSubmit={addTask} className="mb-3 flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2"
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="rounded-lg border px-3 py-2 text-sm"
          disabled={!userId || busy || !title.trim()}
        >
          + Task
        </button>
      </form>

      {err && <div className="mb-2 text-xs text-red-600">{err}</div>}

      {/* Tasks list (titles only) */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading tasks…</div>
      ) : error ? (
        <div className="text-xs text-red-600">Error: {error}</div>
      ) : items.length === 0 ? (
        <div className="text-xs text-gray-500">No tasks yet.</div>
      ) : (
        <ul className="space-y-1">
          {items.map((t) => (
            <li key={t.id} className="rounded-lg bg-white px-3 py-2 text-sm font-medium">
              {t.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
