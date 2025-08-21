// src/lib/useTasks.ts
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
  deleteField,
} from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import type { Status } from '@/lib/types';

export interface Task {
  id: string;
  userId: string;
  chapterId: string;
  title: string;
  notes?: string;
  status: Status;
  dueDate: number | null;
  priority?: string;
  createdAt: number;
  updatedAt: number;
}

function tsToMillis(ts?: Timestamp | null) {
  return ts ? ts.toMillis() : null;
}

export function useTasks(userId?: string, chapterId?: string) {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !chapterId) return;
    setLoading(true);

    const col = collection(db, 'tasks');
    const q = query(
      col,
      where('userId', '==', userId),
      where('chapterId', '==', chapterId),
      orderBy('createdAt', 'asc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Task[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: data.userId,
            chapterId: data.chapterId,
            title: data.title ?? '',
            notes: data.notes ?? '',
            status: (data.status ?? 'todo') as Status,
            dueDate: tsToMillis(data.dueDate ?? null),
            priority: data.priority ?? undefined,
            createdAt: tsToMillis(data.createdAt) ?? Date.now(),
            updatedAt: tsToMillis(data.updatedAt) ?? Date.now(),
          };
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
  }, [userId, chapterId]);

  const api = useMemo(() => {
    return {
      async create(input: {
        title: string;
        notes?: string;
        status?: Status;
        dueDate?: Date | null;
        priority?: string;
      }) {
        if (!userId || !chapterId) throw new Error('Missing userId or chapterId');

        const payload: Record<string, any> = {
          userId,
          chapterId,
          title: input.title.trim(),
          notes: (input.notes ?? '').trim(),
          status: input.status ?? 'todo',
          dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Only include priority if non-empty (rules require string if present)
        if (input.priority && input.priority.trim()) {
          payload.priority = input.priority.trim();
        }

        await addDoc(collection(db, 'tasks'), payload);
      },

      async update(
        id: string,
        patch: Partial<Pick<Task, 'title' | 'notes' | 'status' | 'priority'>> & {
          dueDate?: Date | null;
        },
      ) {
        const ref = doc(db, 'tasks', id);
        const data: Record<string, any> = { updatedAt: serverTimestamp() };

        if (patch.title !== undefined) data.title = patch.title.trim();
        if (patch.notes !== undefined) data.notes = patch.notes.trim();
        if (patch.status !== undefined) data.status = patch.status;
        if (patch.dueDate !== undefined) {
          data.dueDate = patch.dueDate ? Timestamp.fromDate(patch.dueDate) : null;
        }

        // If priority provided: set trimmed value or delete when cleared
        if (patch.priority !== undefined) {
          const v = patch.priority?.trim();
          data.priority = v ? v : deleteField();
        }

        await updateDoc(ref, data);
      },

      async remove(id: string) {
        await deleteDoc(doc(db, 'tasks', id));
      },
    };
  }, [userId, chapterId]);

  return { items, loading, error, ...api };
}
