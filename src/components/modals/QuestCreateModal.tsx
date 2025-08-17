'use client';
import * as React from "react";


import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/app/providers/AuthProvider';

type Domain = { id: string; name: string };
const STATUS = ['todo', 'doing', 'done', 'blocked'] as const;
const PRIORITY = ['low', 'medium', 'high'] as const;

export default function QuestCreateModal({
  open,
  onClose,
  onCreated,
  defaultDomainId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // call to refresh the list
  defaultDomainId?: string | null;
}) {
  const { user } = useAuth();

  const [loadingDomains, setLoadingDomains] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // form fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<(typeof STATUS)[number]>('todo');
  const [priority, setPriority] = useState<(typeof PRIORITY)[number]>('medium');
  const [dueDate, setDueDate] = useState<string>(''); // yyyy-mm-dd
  const [domainId, setDomainId] = useState<string>('');

  // when opened or defaultDomainId changes, load domains & set default
  useEffect(() => {
    let alive = true;
    async function loadDomains() {
      setLoadingDomains(true);
      try {
        const q = query(collection(db, 'domains'), orderBy('name', 'asc'));
        const snap = await getDocs(q);
        const rows: Domain[] = [];
        snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
        if (!alive) return;
        setDomains(rows);
        // set default domain selection
        setDomainId(defaultDomainId ?? '');
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Failed to load domains.');
      } finally {
        if (alive) setLoadingDomains(false);
      }
    }
    if (open) {
      // reset form each time it opens
      setTitle('');
      setSummary('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setErr(null);
      loadDomains();
    }
    return () => {
      alive = false;
    };
  }, [open, defaultDomainId]);

  const domainPlaceholder = useMemo(
    () => (defaultDomainId ? undefined : 'Select Domain'),
    [defaultDomainId]
  );

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !domainId) {
      setErr('Please provide a title and select a domain.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const due = dueDate ? Timestamp.fromDate(new Date(`${dueDate}T00:00:00`)) : null;
      await addDoc(collection(db, 'quests'), {
        title: title.trim(),
        summary: summary.trim(),
        status,
        priority,
        dueDate: due,
        domainId,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onClose();
      onCreated?.();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create quest.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Quest">
      <form onSubmit={onSave} className="space-y-4">
        {err && (
          <div className="rounded-lg border border-red-600 bg-red-900/20 p-2 text-red-200">
            {err}
          </div>
        )}

        {/* Domain */}
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Domain</label>
          <select
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            disabled={loadingDomains}
          >
            {!defaultDomainId && (
              <option value="">{domainPlaceholder || 'Select Domain'}</option>
            )}
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {loadingDomains && <p className="mt-1 text-xs text-zinc-500">Loading domains…</p>}
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Title</label>
          <input
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Name your quest"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Summary</label>
          <textarea
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A short description"
          />
        </div>

        {/* Status / Priority / Due date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Status</label>
            <select
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Priority</label>
            <select
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              {PRIORITY.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Due date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || loadingDomains}
            className="rounded-xl border border-zinc-600 bg-zinc-100 px-4 py-2 text-zinc-900 hover:bg-white disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
