// src/app/providers/AuthProvider.tsx
'use client';

import * as React from 'react';

type FirebaseUser = import('firebase/auth').User | null;

type AuthContextValue = {
  user: FirebaseUser;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<FirebaseUser>(null);
  const [loading, setLoading] = React.useState(true);

  // Subscribe to auth state on the CLIENT only; never import Firebase on the server.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let unsubscribe: (() => void) | undefined;

    (async () => {
      const [{ getAuth, onAuthStateChanged }, { app }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase.client'),
      ]);

      const auth = getAuth(app);
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = React.useCallback(async () => {
    const [{ getAuth, GoogleAuthProvider, signInWithPopup }, { app }] = await Promise.all([
      import('firebase/auth'),
      import('@/lib/firebase.client'),
    ]);
    const auth = getAuth(app);
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const signOut = React.useCallback(async () => {
    const [{ getAuth, signOut }, { app }] = await Promise.all([
      import('firebase/auth'),
      import('@/lib/firebase.client'),
    ]);
    await signOut(getAuth(app));
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, loading, signInWithGoogle, signOut }),
    [user, loading, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => React.useContext(AuthContext);
