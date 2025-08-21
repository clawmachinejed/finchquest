// src/env/env.server.ts
import { z } from 'zod';

// Prevent accidental client import
if (typeof window !== 'undefined') {
  throw new Error('env.server.ts was imported in a browser context. Use env.client.ts instead.');
}

// Normalize escaped newlines in private keys read from .env files.
const PrivateKeySchema = z
  .string()
  .min(1, 'FIREBASE_ADMIN_PRIVATE_KEY is required')
  .transform((val) => val.replace(/\\n/g, '\n'));

const ServerEnvSchema = z
  .object({
    // Inline Admin creds (OPTIONAL collectively; required as a set if used)
    FIREBASE_ADMIN_PROJECT_ID: z.string().optional(),
    FIREBASE_ADMIN_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_ADMIN_PRIVATE_KEY: PrivateKeySchema.optional(),

    // Alternative: Application Default Credentials via JSON file path
    GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

    // Optional bucket (safe to omit)
    FIREBASE_STORAGE_BUCKET: z.string().optional(),
  })
  .refine(
    (v) =>
      // EITHER inline creds (all three present)
      (v.FIREBASE_ADMIN_PROJECT_ID &&
        v.FIREBASE_ADMIN_CLIENT_EMAIL &&
        v.FIREBASE_ADMIN_PRIVATE_KEY) ||
      // OR ADC via JSON file path
      !!v.GOOGLE_APPLICATION_CREDENTIALS,
    {
      message:
        'Provide either inline Admin creds (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY) OR GOOGLE_APPLICATION_CREDENTIALS.',
      path: ['FIREBASE_ADMIN_PRIVATE_KEY'], // any path just to surface nicely
    },
  );

const parsed = ServerEnvSchema.safeParse({
  FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
});

if (!parsed.success) {
  console.error('Server env validation failed:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid server environment variables. Check server .env.* configuration.');
}

export const serverEnv = parsed.data;

// Strongly typed credentials for firebase-admin/app cert()
export type AdminCreds = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

export const firebaseAdminCredentials: AdminCreds | undefined = serverEnv.FIREBASE_ADMIN_PRIVATE_KEY
  ? {
      projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: serverEnv.FIREBASE_ADMIN_PRIVATE_KEY!,
    }
  : undefined;
