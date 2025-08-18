'use client'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db } from '@/lib/firebase.client'

export type Domain = { id: string; name: string }

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const q = query(collection(db, 'domains'), orderBy('name'))
    const unsub = onSnapshot(q, snap => {
      setDomains(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setLoading(false)
    }, (e) => { setError(e.message); setLoading(false) })
    return () => unsub()
  }, [])

  return { domains, loading, error }
}
