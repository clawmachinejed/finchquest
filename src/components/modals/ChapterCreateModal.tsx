'use client';
import * as React from "react";


import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/app/providers/AuthProvider';

type Domain = { id: string; name: string };
type Quest = { id: string; title: string };

const STATUS = ['todo', 'doing', 'done', 'blocked'] as const;
const PRIORITY = ['low', 'medium', 'high'] as const;

export default function ChapterCreateModal({
  open,
  onClose,
  onCreated,
  domainId,
  questId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  domainId: string;
  questId: string;
}) {
  const { user } = useAuth();

  const [domain, setDomain] = useState<Domain | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loadingCtx, setLoadingCtx] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<(typeof STATUS)[number]>('todo');
  const [priority, setPriority] = useState<(typeof PRIORITY)[number]>('medium');
  const [dueDate, setDueDate] = useState<string>(''); // yyyy-mm-dd

  useEffect(() => {
    let alive = true;
    async function loadCtx() {
      setLoadingCtx(true);
      try {
        const [dSnap, qSnap] = await Promise.all([
          getDoc(doc(db, 'domains', domainId)),
          getDoc(doc(db, 'quests', questId)),
        ]);
        if (alive) {
          if (dSnap.exists()) setDomain({ id: dSnap.id, ...(dSnap.data() as any) });
          if (qSnap.exists()) setQuest({ id: qSnap.id, ...(qSnap.data() as any) });
        }
      } finally {
        if (alive) setLoadingCtx(false);
      }
    }
    if (open) {
      // reset form on open
      setTitle('');
      setSummary('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setErr(null);
      if (domainId && questId) loadCtx();
    }
    return () => { alive = false; };
  }, [open, domainId, questId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) { setErr('Please provide a title.'); return; }
    setSaving(true);
    setErr(null);
    try {
      const due = dueDate ? Timestamp.fromDate(new Date(`${dueDate}T00:00:00`)) : null;
      await addDoc(collection(db, 'chapters'), {
        title: title.trim(),
        summary: summary.trim(),
        status,
        priority,
        dueDate: due,
        questId,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onClose();
      onCreated?.();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create chapter.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Chapter">
      <form onSubmit={onSave} className="space-y-4">
        {err && <div className="rounded-lg border border-red-600 bg-red-900/20 p-2 text-red-200">{err}</div>}

        {/* Read-only context */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Domain</label>
            <input
              className="w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-400"
              value={loadingCtx ? 'Loading…' : (domain?.name ?? '—')}
              readOnly
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Quest</label>
            <input
              className="w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-400"
              value={loadingCtx ? 'Loading…' : (quest?.title ?? '—')}
              readOnly
            />
          </div>
        </div>

        {/* Editable fields */}
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Title</label>
          <input className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Summary</label>
          <textarea className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100" rows={3}
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

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="rounded-xl border border-zinc-600 bg-zinc-100 px-4 py-2 text-zinc-900 hover:bg-white disabled:opacity-60">
            {saving ? 'Creating…' : 'Create'}
          </button>
          <button type="button" onClick={onClose}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
