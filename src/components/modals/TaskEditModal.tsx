'use client';
import * as React from "react";


import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Timestamp, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import { useAuth } from '@/app/providers/AuthProvider';

type Domain = { id: string; name: string };
type Quest = { id: string; title: string; domainId?: string };
type Chapter = { id: string; title: string; questId?: string };
type Task = {
  id: string;
  title: string;
  notes?: string;
  status?: 'todo' | 'doing' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  userId: string;
  dueDate?: any | null;
  chapterId?: string;
  createdAt?: any;
  updatedAt?: any;
};

const STATUS = ['todo', 'doing', 'done', 'blocked'] as const;
const PRIORITY = ['low', 'medium', 'high'] as const;

function fmt(ts?: any) {
  if (!ts) return '—';
  try {
    const d: Date = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  } catch {
    return '—';
  }
}

export default function TaskEditModal({
  taskId,
  open,
  onClose,
  onSaved,
}: {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { user } = useAuth();

  // context
  const [domain, setDomain] = useState<Domain | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loadingCtx, setLoadingCtx] = useState(false);

  // fields
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<(typeof STATUS)[number]>('todo');
  const [priority, setPriority] = useState<(typeof PRIORITY)[number]>('medium');
  const [dueDate, setDueDate] = useState<string>('');

  // timestamps
  const [createdAt, setCreatedAt] = useState<any>(null);
  const [updatedAt, setUpdatedAt] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    async function loadAll() {
      if (!open || !taskId || !user) return;

      setLoading(true);
      setErr(null);

      try {
        const tRef = doc(db, 'tasks', taskId);
        const tSnap = await getDoc(tRef);
        if (!tSnap.exists()) { setErr('Task not found.'); return; }
        const d = tSnap.data() as Task;
        if (d.userId !== user.uid) { setErr('You do not have access to this task.'); return; }

        if (!alive) return;

        setTitle(d.title ?? '');
        setNotes(d.notes ?? '');
        setStatus((d.status as any) || 'todo');
        setPriority((d.priority as any) || 'medium');
        if (d.dueDate?.toDate) {
          const dt = d.dueDate.toDate() as Date;
          setDueDate(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`);
        } else setDueDate('');

        setCreatedAt(d.createdAt ?? null);
        setUpdatedAt(d.updatedAt ?? null);

        if (d.chapterId) {
          setLoadingCtx(true);
          const chSnap = await getDoc(doc(db, 'chapters', d.chapterId));
          if (chSnap.exists() && alive) {
            const ch = { id: chSnap.id, ...(chSnap.data() as any) } as Chapter;
            setChapter(ch);

            const qId = ch.questId;
            if (qId) {
              const qSnap = await getDoc(doc(db, 'quests', qId));
              if (qSnap.exists() && alive) {
                const q = { id: qSnap.id, ...(qSnap.data() as any) } as Quest;
                setQuest(q);

                const dId = q.domainId;
                if (dId) {
                  const dSnap2 = await getDoc(doc(db, 'domains', dId));
                  if (dSnap2.exists() && alive) {
                    setDomain({ id: dSnap2.id, ...(dSnap2.data() as any) });
                  }
                }
              }
            }
          }
          if (alive) setLoadingCtx(false);
        }
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Failed to load task.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (open) setErr(null);
    loadAll();
    return () => { alive = false; };
  }, [open, taskId, user]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!taskId) return;
    setSaving(true);
    setErr(null);
    try {
      const ref = doc(db, 'tasks', taskId);
      const due = dueDate ? Timestamp.fromDate(new Date(`${dueDate}T00:00:00`)) : null;
      await updateDoc(ref, {
        title: title.trim(),
        notes: notes.trim(),
        status,
        priority,
        dueDate: due,
        updatedAt: serverTimestamp(),
      });
      onClose();
      onSaved?.();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Task">
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : (
        <form onSubmit={onSave} className="space-y-4">
          {err && <div className="rounded-lg border border-red-600 bg-red-900/20 p-2 text-red-200">{err}</div>}

          {/* Read-only context */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-zinc-300">Domain</label>
              <input className="w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-400"
                value={loadingCtx ? 'Loading…' : domain?.name ?? '—'} readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">Quest</label>
              <input className="w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-400"
                value={loadingCtx ? 'Loading…' : quest?.title ?? '—'} readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">Chapter</label>
              <input className="w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-400"
                value={loadingCtx ? 'Loading…' : chapter?.title ?? '—'} readOnly />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300">Task</label>
            <input className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Notes</label>
            <textarea className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100" rows={4}
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-zinc-300">Status</label>
              <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                value={status} onChange={(e) => setStatus(e.target.value as any)}>
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">Priority</label>
              <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                {PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">Due date</label>
              <input type="date" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {/* Read-only timestamps */}
          <div className="mt-2 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
            <span>Created: {fmt(createdAt)}</span>
            <span className="mx-2">•</span>
            <span>Modified: {fmt(updatedAt)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="rounded-xl border border-zinc-600 bg-zinc-100 px-4 py-2 text-zinc-900 hover:bg-white disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={onClose}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800">
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
