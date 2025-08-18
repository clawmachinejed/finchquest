'use client'
import Link from 'next/link'

import { useDomains } from '@/lib/useDomains'

export default function DomainsPage() {
  const { domains, loading, error } = useDomains()

  if (loading) return <main className="p-6">Loading domains…</main>
  if (error) return <main className="p-6 text-red-600">Error: {error}</main>

  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Domains</h1>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((d) => (
          <li key={d.id} className="rounded-xl border p-4 transition hover:shadow">
            <div className="mb-2 text-lg font-medium">{d.name}</div>
            <Link
              href={`/quests?domain=${d.id}`}
              className="inline-block rounded border px-3 py-1"
            >
              View Quests →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
