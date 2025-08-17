'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';

type DomainKey = 'guild' | 'keep' | 'forge' | 'side';

const ALL: DomainKey[] = ['guild', 'keep', 'forge', 'side'];

const LABELS: Record<DomainKey, string> = {
  guild: 'Guild Missions',
  keep: 'The Keep',
  forge: 'The Forge',
  side: 'Side Quests',
};

export default function DomainFilterBar() {
  const sp = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Read selection from URL. Support BOTH:
  //   ?domain=guild&domain=keep
  //   ?domain=guild,keep
  const initial = useMemo<DomainKey[]>(() => {
    const multi = sp.getAll('domain').filter(Boolean) as DomainKey[];
    if (multi.length > 0) return dedupe(validOnly(multi));
    const csv = sp.get('domain');
    if (!csv) return [];
    return dedupe(validOnly(csv.split(',') as DomainKey[]));
  }, [sp]);

  const isAll = initial.length === 0 || initial.length === ALL.length;

  function setSelection(next: DomainKey[]) {
    const params = new URLSearchParams(sp.toString());
    // Clear existing domain params
    params.delete('domain');
    // Write as repeated params (better than CSV for getAll)
    next.forEach((d) => params.append('domain', d));
    // If selecting all (or none), we remove the filter for clarity
    if (next.length === 0 || next.length === ALL.length) {
      params.delete('domain');
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(`/quests${qs ? `?${qs}` : ''}`);
    });
  }

  function toggle(d: DomainKey) {
    const set = new Set(initial);
    if (set.has(d)) set.delete(d);
    else set.add(d);
    setSelection(Array.from(set));
  }

  function selectAll() {
    // Remove filter entirely for "All Quests"
    setSelection([]);
  }

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-3 border-b border-white/10 bg-background/80 px-4 py-2 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        {/* All Quests pill */}
        <button
          type="button"
          aria-pressed={isAll}
          onClick={selectAll}
          className={[
            basePill,
            isAll ? activePill : idlePill,
            pending ? 'opacity-60' : '',
          ].join(' ')}
        >
          All Quests
        </button>

        {/* Domain pills */}
        {ALL.map((d) => {
          const active = initial.includes(d) || (isAll && initial.length === 0);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(d)}
              className={[
                basePill,
                initial.length === 0 // when "All" (no filter), show idle pills
                  ? idlePill
                  : active
                  ? activePill
                  : idlePill,
                pending ? 'opacity-60' : '',
              ].join(' ')}
            >
              {LABELS[d]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- styles ---------- */
const basePill =
  'rounded-full border border-white/10 px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/20';
const activePill = 'bg-white/10 text-white';
const idlePill = 'hover:bg-white/5';
/* ---------- helpers ---------- */
function dedupe<T>(arr: T[]) {
  return Array.from(new Set(arr));
}
function validOnly(arr: string[]): DomainKey[] {
  return arr.filter((x): x is DomainKey =>
    ['guild', 'keep', 'forge', 'side'].includes(x),
  );
}
