'use client';

import {
  initializeApp,
  getApps,
  type FirebaseApp,
} from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as _signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  type User,
  type Unsubscribe,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

import { env } from '@/env';

// ---- App singleton ----------------------------------------------------------

let app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

function ensureApp(): FirebaseApp {
  if (!app) {
    app = initializeApp({
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }
  return app;
}

// Public helpers (preferred new API)
export function getAuthClient(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}

// ---- Legacy-compatible re-exports ------------------------------------------
// Many files still do: `import { db } from '@/lib/firebase.client'`
export const auth: Auth = getAuthClient();
export const db: Firestore = getDb();

// Keep the callback signature used across the app:
// Old usage 1: onAuthChanged((user) => { ... })
// Old usage 2: onAuthChanged(auth, (user) => { ... })
export function onAuthChanged(cb: (user: User | null) => void): Unsubscribe;
export function onAuthChanged(a: Auth, cb: (user: User | null) => void): Unsubscribe;
export function onAuthChanged(aOrCb: Auth | ((user: User | null) => void), maybeCb?: (user: User | null) => void): Unsubscribe {
  if (typeof aOrCb === 'function') {
    return _onAuthStateChanged(getAuthClient(), aOrCb);
  }
  // aOrCb is Auth
  return _onAuthStateChanged(aOrCb, maybeCb as (user: User | null) => void);
}

// Old usage: `await signInWithGooglePopup()` OR `await signInWithGooglePopup(auth)`
export async function signInWithGooglePopup(a?: Auth): Promise<void> {
  const authInst = a ?? getAuthClient();
  const provider = new GoogleAuthProvider();
  await _signInWithPopup(authInst, provider);
}

// Re-export types used by context/hooks
export type { User, Unsubscribe };
