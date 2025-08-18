'use client';
import * as React from "react";


import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Timestamp, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import { useAuth } from '@/app/providers/AuthProvider';

type Domain = { id: string; name: string };
type Quest = { id: string; title: string; domainId?: string };
type Chapter = {
  id: string;
  title: string;
  summary?: string;
  status?: 'todo' | 'doing' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  userId: string;
  dueDate?: any | null;
  questId?: string;
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

export default function ChapterEditModal({
  chapterId,
  open,
  onClose,
  onSaved,
}: {
  chapterId: string | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { user } = useAuth();

  // context
  const [domain, setDomain] = useState<Domain | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loadingCtx, setLoadingCtx] = useState(false);

  // fields
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<(typeof STATUS)[number]>('todo');
  const [priority, setPriority] = useState<(typeof PRIORITY)[number]>('medium');
  const [dueDate, setDueDate] = useState<string>('');

  // timestamps
  const [createdAt, setCreatedAt] = useState<any>(null);
  const [updatedAt, setUpdatedAt] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    async function loadAll() {
      if (!open || !chapterId || !user) return;

      setLoading(true);
      setErr(null);

      try {
        const chRef = doc(db, 'chapters', chapterId);
        const chSnap = await getDoc(chRef);
        if (!chSnap.exists()) { setErr('Chapter not found.'); return; }
        const d = chSnap.data() as Chapter;
        if (d.userId !== user.uid) { setErr('You do not have access to this chapter.'); return; }

        if (!alive) return;

        setTitle(d.title ?? '');
        setSummary(d.summary ?? '');
        setStatus((d.status as any) || 'todo');
        setPriority((d.priority as any) || 'medium');
        if (d.dueDate?.toDate) {
          const dt = d.dueDate.toDate() as Date;
          setDueDate(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`);
        } else setDueDate('');

        setCreatedAt(d.createdAt ?? null);
        setUpdatedAt(d.updatedAt ?? null);

        if (d.questId) {
          setLoadingCtx(true);
          const qSnap = await getDoc(doc(db, 'quests', d.questId));
          if (qSnap.exists() && alive) {
            const q = { id: qSnap.id, ...(qSnap.data() as any) } as Quest;
            setQuest(q);
            if (q.domainId) {
              const dSnap = await getDoc(doc(db, 'domains', q.domainId));
              if (dSnap.exists() && alive) setDomain({ id: dSnap.id, ...(dSnap.data() as any) });
            }
          }
          if (alive) setLoadingCtx(false);
        }
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Failed to load chapter.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (open) setErr(null);
    loadAll();
    return () => { alive = false; };
  }, [open, chapterId, user]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!chapterId) return;
    setSaving(true);
    setErr(null);
    try {
      const ref = doc(db, 'chapters', chapterId);
      const due = dueDate ? Timestamp.fromDate(new Date(`${dueDate}T00:00:00`)) : null;
      await updateDoc(ref, {
        title: title.trim(),
        summary: summary.trim(),
        status,
        priority,
        dueDate: due,
        updatedAt: serverTimestamp(),
      });
      onClose();
      onSaved?.();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to save chapter.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Chapter">
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : (
        <form onSubmit={onSave} className="space-y-4">
          {err && <div className="rounded-lg border border-red-600 bg-red-900/20 p-2 text-red-200">{err}</div>}

          {/* Read-only Domain / Quest */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300">Chapter</label>
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
