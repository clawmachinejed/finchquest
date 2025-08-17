'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase.client';

type AuthCtxValue = { user: User | null; loading: boolean };

const AuthCtx = createContext<AuthCtxValue>({ user: null, loading: true });
export const useAuth = () => useContext(AuthCtx);

/**
 * AuthProvider
 * Subscribes to Firebase Auth and exposes {user, loading} to children.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return <AuthCtx.Provider value={{ user, loading }}>{children}</AuthCtx.Provider>;
}
