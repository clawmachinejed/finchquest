// src/lib/useChapters.ts
'use client'

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
  getFirestore,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

import { db } from '@/lib/firebase.client'
import type { Chapter, Status } from '@/lib/types'

function tsToMillis(ts?: Timestamp | null) {
  return ts ? ts.toMillis() : null
}

export function useChapters(userId: string | undefined, questId: string | undefined) {
  const [items, setItems] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !questId) return
    setLoading(true)
    const col = collection(db, 'chapters')
    const q = query(
      col,
      where('userId', '==', userId),
      where('questId', '==', questId),
      orderBy('createdAt', 'asc'),
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Chapter[] = snap.docs.map((d) => {
          const data = d.data() as any
          return {
            id: d.id,
            userId: data.userId,
            questId: data.questId,
            title: data.title ?? '',
            summary: data.summary ?? '',
            status: (data.status ?? 'todo') as Status,
            dueDate: tsToMillis(data.dueDate ?? null),
            createdAt: tsToMillis(data.createdAt) ?? Date.now(),
            updatedAt: tsToMillis(data.updatedAt) ?? Date.now(),
          }
        })
        setItems(next)
        setLoading(false)
      },
      (e) => {
        setError(e.message)
        setLoading(false)
      },
    )
    return () => unsub()
  }, [userId, questId])

  const api = useMemo(() => {
    return {
      async create(input: {
        title: string
        summary?: string
        status?: Status
        dueDate?: Date | null
      }) {
        if (!userId || !questId) throw new Error('Missing userId or questId')
        const col = collection(db, 'chapters')
        const payload = {
          userId,
          questId,
          title: input.title.trim(),
          summary: (input.summary ?? '').trim(),
          status: input.status ?? 'todo',
          dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        await addDoc(col, payload)
      },
      async update(id: string, patch: Partial<Pick<Chapter, 'title'|'summary'|'status'>> & { dueDate?: Date | null }) {
        const ref = doc(db, 'chapters', id)
        const payload: Record<string, any> = {
          updatedAt: serverTimestamp(),
        }
        if (patch.title !== undefined) payload.title = patch.title.trim()
        if (patch.summary !== undefined) payload.summary = patch.summary.trim()
        if (patch.status !== undefined) payload.status = patch.status
        if (patch.dueDate !== undefined) {
          payload.dueDate = patch.dueDate ? Timestamp.fromDate(patch.dueDate) : null
        }
        await updateDoc(ref, payload)
      },
      async remove(id: string) {
        const ref = doc(db, 'chapters', id)
        await deleteDoc(ref)
      },
    }
  }, [userId, questId])

  return { items, loading, error, ...api }
}
