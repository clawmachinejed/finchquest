'use client';

import * as React from 'react';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    (async () => {
      // guard against SSR
      if (typeof window === 'undefined') return;

      try {
        const mod = await import('@/lib/firebase.client');
        const { auth, onAuthStateChanged } = mod;

        unsub = onAuthStateChanged(auth, (user: User | null) => {
          if (cancelled) return;
          if (user) router.replace('/domain');
          setReady(true);
        });

        // Also mark ready if no listener fires immediately
        if (!unsub) setReady(true);
      } catch (err) {
        console.error('Sign-in init failed', err);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [router]);

  const handleGoogleSignIn = React.useCallback(async () => {
    setBusy(true);
    try {
      const mod = await import('@/lib/firebase.client');
      const { auth, GoogleAuthProvider, signInWithPopup } = mod;
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace('/domain');
    } catch (err) {
      console.error('Google sign-in failed', err);
      setBusy(false);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        aria-busy={busy}
      >
        Continue with Google
      </button>
    </main>
  );
}
