import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  getFirestore,
  Firestore,
} from 'firebase/firestore';

// If you have local types, keep using them.
// Minimal shape to satisfy component usage without stripping anything you already have.
export interface Chapter {
  id: string;
  userId: string;
  questId?: string | null;
  title: string;
  summary?: string | null;
  status?: 'todo' | 'doing' | 'done' | 'blocked';
  dueDate?: Timestamp | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

// Keep the “return shape” your UI currently expects:
//
//   const { items, loading, error, create } = useChapters(userId, questId)
//
// …where `items` is your chapters array.
export function useChapters(userId?: string | null, questId?: string | null) {
  const db: Firestore = getFirestore();

  const [items, setItems] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there’s no user yet, expose the empty/loading‑false state
    if (!userId) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    const constraints = [where('userId', '==', userId as string)];
    if (questId) constraints.push(where('questId', '==', questId as string));

    const q = query(
      collection(db, 'chapters'),
      ...constraints,
      // Safe default; if you don’t index this, remove the orderBy line.
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Chapter[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Chapter, 'id'>),
        }));
        setItems(next);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(e.message || 'Failed to load chapters');
        setLoading(false);
      },
    );

    return unsub;
  }, [db, userId, questId]);

  // Minimal creator to satisfy existing call sites
  const create = useCallback(
    async (data: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => {
      await addDoc(collection(db, 'chapters'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    },
    [db],
  );

  return { items, loading, error, create };
}

export type UseChaptersReturn = ReturnType<typeof useChapters>;
