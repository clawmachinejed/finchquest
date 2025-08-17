// src/lib/firebase.admin.ts
import "server-only";
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import {
  getFirestore,
  type Firestore,
  Timestamp,
  FieldValue,
} from "firebase-admin/firestore";

let app: App;
if (!getApps().length) {
  app = initializeApp({
    // Uses GOOGLE_APPLICATION_CREDENTIALS or default creds in your env.
    // If you need explicit creds, wire them here via process.env.*.
  });
} else {
  app = getApps()[0]!;
}

const AdminDb: Firestore = getFirestore(app);

// Back-compat alias so older code `import { db } ...` still works:
const db = AdminDb;

export { app, AdminDb, db, Timestamp, FieldValue };
