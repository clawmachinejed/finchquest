// src/components/chapters/ChaptersInline.tsx
'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useChapters } from '@/lib/useChapters';

export default function ChaptersInline(props: {
  userId?: string;
  questId: string;
  domainId?: string;
}) {
  const { userId, questId } = props;
  const { items, loading, error, create } = useChapters(userId, questId);

  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>(''); // used for API errors
  const [toast, setToast] = useState<string>(''); // UI toast message

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function addChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setBusy(true);
      setErr('');

      // ✅ Guard before calling create — show a toast, not just console.error
      if (!userId) {
        setToast('Please sign in to create a chapter.');
        return;
      }

      await create({
        userId, // now narrowed to string
        questId,
        title: title.trim(),
        summary: undefined,
        status: 'todo',
        dueDate: null,
      });
      setTitle('');
      setToast('Chapter created.');
    } catch (e: any) {
      setErr(e?.message || 'Failed to add chapter');
      setToast('Failed to add chapter.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mt-3 rounded-xl border bg-gray-50/60 p-3">
      {/* Toast (top-right) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-black/80 px-3 py-2 text-xs font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {/* Quick add */}
      <form onSubmit={addChapter} className="mb-3 flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2"
          placeholder="New chapter name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded-lg border px-3 py-2 text-sm" disabled={!title.trim() || busy}>
          + Chapter
        </button>
      </form>

      {/* API error (non-toast) */}
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
  );
}
