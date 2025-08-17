'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  // (keep adding here if you need more auth fns re-exported)
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Client-side config (NEXT_PUBLIC_* only)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Export the singleton instances AND the auth helpers your UI expects
export { app, auth, db, onAuthStateChanged, GoogleAuthProvider, signInWithPopup };
