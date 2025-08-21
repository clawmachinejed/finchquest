'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';
import { useTasksAll } from '@/lib/useTasksAll';

type Task = {
  id: string;
  title: string;
  notes?: string;
  status?: 'todo' | 'doing' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  chapterId: string;
  userId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  dueDate?: number | null;
};

function isToday(millis: number) {
  const d = new Date(millis);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function TodayPage() {
  const { user } = useAuth();
  // useTasksAll returns { items, loading, error } and expects string | undefined
  const { items = [], loading, error } = useTasksAll(user?.uid ?? undefined);
  const tasks = items as Task[];

  const todaysTasks = tasks.filter((t: Task) => !!t.dueDate && isToday(Number(t.dueDate)));

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Today</h1>

      {loading && <div>Loading…</div>}
      {!loading && error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && todaysTasks.length === 0 && (
        <div className="text-muted-foreground">No tasks due today.</div>
      )}

      {todaysTasks.length > 0 && (
        <ul className="divide-y">
          {todaysTasks.map((t: Task) => (
            <li key={t.id} className="flex items-center justify-between p-3">
              <span>{t.title}</span>
              <Link href={`/tasks?chapter=${t.chapterId}`} className="text-sm underline">
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
