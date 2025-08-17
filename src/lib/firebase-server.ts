// src/lib/firebase-server.ts
import 'server-only';

import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import {
  getFirestore,
  FieldValue as AdminFieldValue,
  Timestamp as AdminTimestamp,
  type Firestore,
} from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Initialize Admin SDK from env.
 * Supports either GOOGLE_APPLICATION_CREDENTIALS or explicit vars:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * PRIVATE KEY may contain \n sequences; we normalize them.
 */
function makeAdminApp(): App {
  if (getApps().length) return getApps()[0]!;
  const hasExplicitCreds =
    !!process.env.FIREBASE_PROJECT_ID &&
    !!process.env.FIREBASE_CLIENT_EMAIL &&
    !!process.env.FIREBASE_PRIVATE_KEY;

  return initializeApp(
    hasExplicitCreds
      ? {
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // optional
        }
      : {
          // Fall back to ADC (GOOGLE_APPLICATION_CREDENTIALS)
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        }
  );
}

const adminApp = makeAdminApp();
const adminDb: Firestore = getFirestore(adminApp);
const storageBucket = getStorage(adminApp).bucket();

// Primary, recommended exports
export { adminApp, adminDb, storageBucket };

// Firestore helpers (value + type)
export const adminFieldValue = AdminFieldValue;
export const Timestamp = AdminTimestamp;

// ------------------------------------------------------------------
// Back-compat/aliases so existing code keeps working without changes:
// ------------------------------------------------------------------
export const dbAdmin = adminDb;        // some files import { dbAdmin }
export const FieldValue = adminFieldValue; // some files import { FieldValue }
export const db = adminDb;             // legacy { db } from server file
export const bucket = storageBucket;   // legacy { bucket }
