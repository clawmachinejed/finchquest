// src/lib/firebase.ts
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseClientConfig } from '@/env/env.client';

/** Ensure a single client app instance */
function ensureApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseClientConfig);
}

const app = ensureApp();

/** Single sources of truth (instances), not functions */
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export { app };
