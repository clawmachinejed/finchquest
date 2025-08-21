// src/lib/firebase-server.ts
import 'server-only';
import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import {
  getFirestore,
  FieldValue as AdminFieldValue,
  Timestamp as AdminTimestamp,
  type Firestore,
} from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

import { serverEnv, firebaseAdminCredentials } from '@/env/env.server';

/**
 * Initialize Admin SDK from validated env.
 * Prefer inline creds; fall back to ADC (GOOGLE_APPLICATION_CREDENTIALS) if provided.
 */
function makeAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0]!;

  if (firebaseAdminCredentials) {
    const sa: ServiceAccount = {
      projectId: firebaseAdminCredentials.projectId,
      clientEmail: firebaseAdminCredentials.clientEmail,
      privateKey: firebaseAdminCredentials.privateKey,
    };

    return initializeApp({
      credential: cert(sa),
      storageBucket: serverEnv.FIREBASE_STORAGE_BUCKET, // optional
    });
  }

  // ADC (uses GOOGLE_APPLICATION_CREDENTIALS if set)
  return initializeApp({
    credential: applicationDefault(),
    storageBucket: serverEnv.FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = makeAdminApp();
const adminDb: Firestore = getFirestore(adminApp);
const storageBucket = getStorage(adminApp).bucket();

export { adminApp, adminDb, storageBucket };
export const adminFieldValue = AdminFieldValue;
export const Timestamp = AdminTimestamp;

// Back‑compat aliases (keep legacy imports working)
export const dbAdmin = adminDb;
export const FieldValue = adminFieldValue;
export const db = adminDb;
export const bucket = storageBucket;
