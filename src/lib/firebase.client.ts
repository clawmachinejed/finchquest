'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged as _onAuthStateChanged,
  signInWithPopup as _signInWithPopup,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { env } from '@/env';

// Lazily get/create the Firebase app (client only)
function getClientApp(): FirebaseApp {
  const cfg = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  return getApps().length ? getApp() : initializeApp(cfg);
}

// Preferred helpers (call these inside components/hooks)
export function getDb(): Firestore {
  return getFirestore(getClientApp());
}
export function getAuthClient(): Auth {
  return getAuth(getClientApp());
}
export function onAuthChanged(cb: (user: User | null) => void) {
  return _onAuthStateChanged(getAuthClient(), cb);
}
export async function signInWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  return _signInWithPopup(getAuthClient(), provider);
}

// Back-compat named exports for existing code.
// (Client-only file, so module-scope is OK.)
export const db: Firestore = getDb();
export const auth: Auth = getAuthClient();
