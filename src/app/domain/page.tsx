'use client'
import Link from 'next/link'
import { useDomains } from '@/lib/useDomains'

export default function DomainsPage() {
  const { domains, loading, error } = useDomains()

  if (loading) return <main className="p-6">Loading domains…</main>
  if (error) return <main className="p-6 text-red-600">Error: {error}</main>

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Domains</h1>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((d) => (
          <li key={d.id} className="border rounded-xl p-4 hover:shadow transition">
            <div className="text-lg font-medium mb-2">{d.name}</div>
            <Link
              href={`/quests?domain=${d.id}`}
              className="inline-block border px-3 py-1 rounded"
            >
              View Quests →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
