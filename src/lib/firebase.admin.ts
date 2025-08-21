// Server‑side Firebase Admin SDK bootstrap (Node only).
// Exposes the exact names your code is importing right now:
//   - AdminDb (preferred)
//   - db      (legacy alias)
//   - AdminAuth (if/when you need admin auth)

import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Allow either:
 *  1) GOOGLE_APPLICATION_CREDENTIALS / default ADC (Cloud envs), or
 *  2) Explicit service account via env vars (local/dev).
 */
const app =
  getApps()[0] ??
  initializeApp({
    credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? applicationDefault()
      : cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          // Support multiline private keys provided via env var
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
  });

export const AdminDb = getFirestore(app);

// Keep the legacy named export some routes expect:
export const db = AdminDb;

export const AdminAuth = getAuth(app);
