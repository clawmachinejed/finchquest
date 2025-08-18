'use client';

import { useState } from 'react';

import Breadcrumbs from '@/components/nav/Breadcrumbs';
import LinkWithParams from '@/components/nav/LinkWithParams';

export default function AppTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 p-3">
        {/* Mobile: drawer toggle */}
        <button
          className="rounded-lg border border-white/10 px-3 py-1 md:hidden"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <div className="hidden text-base font-semibold md:block">Finch Quest</div>

        <Breadcrumbs />

        <div className="flex items-center gap-2">
          {/* Quick actions */}
          <LinkWithParams
            href="/meetings/inbox"
            className="hidden rounded-lg border border-white/10 px-3 py-1 text-sm hover:bg-white/5 md:inline-block"
            title="Meetings Inbox"
          >
            Inbox
          </LinkWithParams>
          <LinkWithParams
            href="/settings/automation"
            className="hidden rounded-lg border border-white/10 px-3 py-1 text-sm hover:bg-white/5 md:inline-block"
            title="Automation Settings"
          >
            Automation
          </LinkWithParams>
          {/* Placeholder for global quick add later */}
          <LinkWithParams
            href="/quests"
            className="rounded-lg border border-white/10 px-3 py-1 text-sm hover:bg-white/5"
          >
            + Add
          </LinkWithParams>
        </div>
      </div>

      {/* Simple mobile drawer */}
      {open && (
        <div className="space-y-1 border-t border-white/10 p-3 md:hidden">
          <LinkWithParams
            href="/domain"
            carry={['domain']}
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Domains
          </LinkWithParams>
          <LinkWithParams
            href="/quests"
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Quests
          </LinkWithParams>
          <LinkWithParams
            href="/chapters"
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Chapters
          </LinkWithParams>
          <LinkWithParams
            href="/tasks"
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Tasks
          </LinkWithParams>
          <LinkWithParams
            href="/today"
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Today
          </LinkWithParams>
          <LinkWithParams
            href="/upcoming"
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Upcoming
          </LinkWithParams>

          {/* Added: Meetings Inbox + Automation Settings */}
          <div className="mt-2 border-t border-white/10 pt-2" />
          <LinkWithParams
            href="/meetings/inbox"
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Meetings Inbox
          </LinkWithParams>
          <LinkWithParams
            href="/settings/automation"
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Automation Settings
          </LinkWithParams>
        </div>
      )}
    </header>
  );
}
