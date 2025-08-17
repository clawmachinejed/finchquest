// src/app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";

/**
 * RootLayout is a Server Component by default.
 * Keep it free of client-only code (no useEffect, no dynamic ssr:false).
 * Auth gating happens inside src/app/(app)/layout.tsx.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
