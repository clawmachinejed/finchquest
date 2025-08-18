'use client';
import { Timestamp, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as React from "react";
import { useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import Modal from '@/components/ui/Modal';
import { db } from '@/lib/firebase.client';

type Quest = {
  id: string;
  title: string;
  summary?: string;
  status?: 'todo' | 'doing' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  userId: string;
  dueDate?: any | null;
  createdAt?: any;
  updatedAt?: any;
  domainId?: string;
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

export default function QuestEditModal({
  questId,
  open,
  onClose,
  onSaved,
}: {
  questId: string | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<(typeof STATUS)[number]>('todo');
  const [priority, setPriority] = useState<(typeof PRIORITY)[number]>('medium');
  const [dueDate, setDueDate] = useState<string>(''); // yyyy-mm-dd

  // read-only timestamps
  const [createdAt, setCreatedAt] = useState<any>(null);
  const [updatedAt, setUpdatedAt] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!open || !questId || !user) return;
      setLoading(true);
      setErr(null);
      try {
        const ref = doc(db, 'quests', questId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data() as Quest;
          if (d.userId !== user.uid) {
            setErr('You do not have access to this quest.');
            return;
          }
          if (!alive) return;
          setTitle(d.title ?? '');
          setSummary(d.summary ?? '');
          setStatus((d.status as any) || 'todo');
          setPriority((d.priority as any) || 'medium');
          if (d.dueDate?.toDate) {
            const dt = d.dueDate.toDate() as Date;
            setDueDate(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`);
          } else setDueDate('');

          setCreatedAt(d.createdAt ?? null);
          setUpdatedAt(d.updatedAt ?? null);
        } else {
          setErr('Quest not found.');
        }
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load quest.');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [open, questId, user]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!questId) return;
    setSaving(true);
    setErr(null);
    try {
      const ref = doc(db, 'quests', questId);
      const due = dueDate ? Timestamp.fromDate(new Date(`${dueDate}T00:00:00`)) : null;
      await updateDoc(ref, {
        title: title.trim(),
        summary: summary.trim(),
        status,
        priority,
        dueDate: due,
        updatedAt: serverTimestamp(), // only this doc
      });
      onClose();
      onSaved?.();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to save quest.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Quest">
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : (
        <form onSubmit={onSave} className="space-y-4">
          {err && <div className="rounded-lg border border-red-600 bg-red-900/20 p-2 text-red-200">{err}</div>}

          <div>
            <label className="mb-1 block text-sm text-zinc-300">Title</label>
            <input className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Summary</label>
            <textarea className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100" rows={4}
              value={summary} onChange={(e) => setSummary(e.target.value)} />
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
