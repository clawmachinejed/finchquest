'use client';

import { useSearchParams } from 'next/navigation';

import LinkWithParams from '@/components/nav/LinkWithParams';

export default function AppSidebar() {
  const sp = useSearchParams();
  const currentDomain = sp.get('domain');

  const linkBase =
    'block rounded-lg px-3 py-2 hover:bg-white/5 transition-colors';
  const active = 'bg-white/10 text-white';

  const isActive = (d: string) => currentDomain === d;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 p-4 md:block">
      <div className="mb-4 text-lg font-semibold">Finch Quest</div>

      <nav className="space-y-1">
        {/* Domains home */}
        <LinkWithParams
          href="/domain"
          carry={[]} // don't carry stale domain when going home
          className={linkBase}
          title="Domains"
        >
          Domains
        </LinkWithParams>

        {/* Explore */}
        <div className="mt-4 border-t border-white/10 pt-3 text-xs uppercase tracking-wide text-gray-400">
          Explore
        </div>

        <LinkWithParams
          href="/quests"
          query={{ domain: 'guild' }}
          className={`${linkBase} ${isActive('guild') ? active : ''}`}
          title="Guild Missions"
        >
          Guild Missions
        </LinkWithParams>

        <LinkWithParams
          href="/quests"
          query={{ domain: 'keep' }}
          className={`${linkBase} ${isActive('keep') ? active : ''}`}
          title="The Keep"
        >
          The Keep
        </LinkWithParams>

        <LinkWithParams
          href="/quests"
          query={{ domain: 'forge' }}
          className={`${linkBase} ${isActive('forge') ? active : ''}`}
          title="The Forge"
        >
          The Forge
        </LinkWithParams>

        <LinkWithParams
          href="/quests"
          query={{ domain: 'side' }}
          className={`${linkBase} ${isActive('side') ? active : ''}`}
          title="Side Quests"
        >
          Side Quests
        </LinkWithParams>

        {/* Meetings */}
        <div className="mt-4 border-t border-white/10 pt-3 text-xs uppercase tracking-wide text-gray-400">
          Meetings
        </div>

        <LinkWithParams
          href="/meetings/inbox"
          carry={[]}
          className={linkBase}
          title="Meetings Inbox"
        >
          Meetings Inbox
        </LinkWithParams>

        {/* Settings */}
        <div className="mt-4 border-t border-white/10 pt-3 text-xs uppercase tracking-wide text-gray-400">
          Settings
        </div>

        <LinkWithParams
          href="/settings/automation"
          carry={[]}
          className={linkBase}
          title="Automation Settings"
        >
          Automation
        </LinkWithParams>
      </nav>
    </aside>
  );
}
