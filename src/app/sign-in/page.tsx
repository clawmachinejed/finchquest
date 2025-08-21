'use client';

export const dynamic = 'force-dynamic';

import * as React from 'react';
import { signInWithGooglePopup, onAuthChanged } from '@/lib/firebase.client';

export default function SignInPage() {
  React.useEffect(() => {
    // Ensure we’re not doing anything at build time
    const unsub = onAuthChanged(() => {});
    return () => unsub();
  }, []);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
      <button
        className="rounded-md border px-4 py-2 hover:bg-gray-50"
        onClick={() => signInWithGooglePopup()}
      >
        Continue with Google
      </button>
    </main>
  );
}
