// src/components/nav/AppShell.tsx
'use client';

import type { PropsWithChildren } from 'react';

import AppSidebar from '@/components/nav/AppSidebar';
import AppTopbar from '@/components/nav/AppTopbar';

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh bg-black text-gray-100">
      <AppTopbar />
      <div className="mx-auto flex max-w-screen-2xl">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
