import * as React from 'react';
import type { ReactNode } from 'react';

import Protected from '@/components/auth/Protected';
import AppShell from '@/components/nav/AppShell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <AppShell>{children}</AppShell>
    </Protected>
  );
}
