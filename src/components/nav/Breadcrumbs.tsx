// src/components/nav/Breadcrumbs.tsx
'use client'

import { doc, getDoc } from 'firebase/firestore'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import LinkWithParams from '@/components/nav/LinkWithParams'
import { db } from '@/lib/firebase.client'
import { useDomains } from '@/lib/useDomains'

/**
 * Minimal shape for title lookups in Firestore.
 * We deliberately keep this small to avoid over‑typing the whole doc.
 */
type TitledDoc = { title?: string };

/**
 * Fetch the "title" field for a given document, safely typed.
 * Falls back to the provided fallback string when the field is missing.
 */
async function fetchTitle(
  collection: 'quests' | 'chapters',
  id: string,
  fallback: string
): Promise<string> {
  const snap = await getDoc(doc(db, collection, id))
  const data = snap.data() as TitledDoc | undefined
  return (data?.title?.trim() || fallback)
}

export default function Breadcrumbs() {
  const sp = useSearchParams()
  const domainId = sp.get('domain') || undefined
  const questId = sp.get('quest') || undefined
  const chapterId = sp.get('chapter') || undefined

  const { domains } = useDomains()
  const domainName =
    domains.find((d) => d.id === domainId)?.name ?? (domainId ? domainId : undefined)

  const [questTitle, setQuestTitle] = useState<string | undefined>(undefined)
  const [chapterTitle, setChapterTitle] = useState<string | undefined>(undefined)

  useEffect(() => {
    let alive = true

    ;(async () => {
      if (questId) {
        const title = await fetchTitle('quests', questId, questId)
        if (alive) setQuestTitle(title)
      } else {
        setQuestTitle(undefined)
      }

      if (chapterId) {
        const title = await fetchTitle('chapters', chapterId, chapterId)
        if (alive) setChapterTitle(title)
      } else {
        setChapterTitle(undefined)
      }
    })()

    return () => {
      alive = false
    }
  }, [questId, chapterId])

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm text-gray-400"
    >
      <LinkWithParams href="/domain" carry={['domain']} className="hover:text-gray-200">
        Domain
      </LinkWithParams>

      {domainName && (
        <>
          <span className="px-1" aria-hidden>›</span>
          <span className="text-gray-200">{domainName}</span>
        </>
      )}

      <span className="px-1" aria-hidden>›</span>
      <LinkWithParams href="/quests" className="hover:text-gray-200">
        Quests
      </LinkWithParams>

      {questTitle && (
        <>
          <span className="px-1" aria-hidden>›</span>
          <span className="text-gray-200">{questTitle}</span>
        </>
      )}

      {chapterTitle && (
        <>
          <span className="px-1" aria-hidden>›</span>
          <span className="text-gray-200">{chapterTitle}</span>
        </>
      )}
    </nav>
  )
}
