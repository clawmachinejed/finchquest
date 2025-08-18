// src/env.ts
import { z } from "zod";

// Only expose NEXT_PUBLIC_* on the client.
// (Server-only secrets like FIREBASE_ADMIN_* should live in server code only.)
const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "AIzaSyCJQmkWKRLSPUdr3WTmYTTypSd2ViDXewM"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "finch-quest.firebaseapp.com"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "finch-quest"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "finch-quest.appspot.com"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "272036858918"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "1:272036858918:web:bc029a6fc63aed0b8c6ae7"),
  // Optional; include if you use Analytics
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
});

export const env = clientSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});
