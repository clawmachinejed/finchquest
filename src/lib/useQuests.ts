// src/lib/useQuests.ts
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import type { Status } from '@/lib/types';

export interface Quest {
  id: string;
  userId: string;
  domainId: string;
  title: string;
  summary: string;
  status: Status;
  dueDate: number | null;
  createdAt: number;
  updatedAt: number;
}

function tsToMillis(ts?: Timestamp | null) {
  return ts ? ts.toMillis() : null;
}

export function useQuests(userId?: string, domainId?: string) {
  const [items, setItems] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const col = collection(db, 'quests');
    const constraints: any[] = [where('userId', '==', userId)];
    if (domainId) constraints.push(where('domainId', '==', domainId));
    constraints.push(orderBy('createdAt', 'asc'));

    const q = query(col, ...constraints);

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: data.userId,
            domainId: data.domainId,
            title: data.title ?? '',
            summary: data.summary ?? '',
            status: (data.status ?? 'todo') as Status,
            dueDate: tsToMillis(data.dueDate ?? null),
            createdAt: tsToMillis(data.createdAt) ?? Date.now(),
            updatedAt: tsToMillis(data.updatedAt) ?? Date.now(),
          } as Quest;
        });
        setItems(next);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [userId, domainId]);

  const api = useMemo(() => {
    return {
      async create(input: {
        domainId: string;
        title: string;
        summary?: string;
        status?: Status;
        dueDate?: Date | null;
      }) {
        if (!userId) throw new Error('Missing userId');
        const col = collection(db, 'quests');
        const payload = {
          userId,
          domainId: input.domainId,
          title: input.title.trim(),
          summary: (input.summary ?? '').trim(),
          status: input.status ?? 'todo',
          dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await addDoc(col, payload);
      },
      async update(
        id: string,
        patch: Partial<Pick<Quest, 'title' | 'summary' | 'status' | 'domainId'>> & {
          dueDate?: Date | null;
        },
      ) {
        const ref = doc(db, 'quests', id);
        const payload: Record<string, any> = { updatedAt: serverTimestamp() };
        if (patch.title !== undefined) payload.title = patch.title.trim();
        if (patch.summary !== undefined) payload.summary = patch.summary.trim();
        if (patch.status !== undefined) payload.status = patch.status;
        if (patch.domainId !== undefined) payload.domainId = patch.domainId;
        if (patch.dueDate !== undefined)
          payload.dueDate = patch.dueDate ? Timestamp.fromDate(patch.dueDate) : null;
        await updateDoc(ref, payload);
      },
      async remove(id: string) {
        await deleteDoc(doc(db, 'quests', id));
      },
    };
  }, [userId]);

  return { items, loading, error, ...api };
}
