// src/app/providers/AuthProvider.tsx
'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase.client';

// Context shape
type AuthContextValue = {
  user: FirebaseUser | null;
  loading: boolean;
};

// Create context
const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

// Named export: Provider component (used in app/layout.tsx)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const auth = getAuthClient();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = React.useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Default export: hook (so pages can `import useAuth from ...`)
export default function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
