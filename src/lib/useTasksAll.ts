// src/lib/useTasksAll.ts
'use client'

import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { type Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db } from '@/lib/firebase.client'
import type { Task } from '@/lib/useTasks'


function tsToMillis(ts?: Timestamp | null) {
  return ts ? ts.toMillis() : null
}

export function useTasksAll(userId?: string) {
  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    // Keep this index-free for now: order by createdAt (we already have that index)
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(
      q,
      snap => {
        const next: Task[] = snap.docs.map(d => {
          const data = d.data() as any
          return {
            id: d.id,
            userId: data.userId,
            chapterId: data.chapterId,
            title: data.title ?? '',
            notes: data.notes ?? '',
            status: data.status ?? 'todo',
            dueDate: tsToMillis(data.dueDate ?? null),
            priority: data.priority ?? undefined,
            createdAt: tsToMillis(data.createdAt) ?? Date.now(),
            updatedAt: tsToMillis(data.updatedAt) ?? Date.now(),
          } as Task
        })
        setItems(next)
        setLoading(false)
      },
      e => {
        setError(e.message)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [userId])

  return { items, loading, error }
}
