import './globals.css';
import * as React from 'react';
import type { ReactNode } from 'react';

import AuthProvider from './providers/AuthProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
