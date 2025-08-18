// src/app/api/settings/automation/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AdminDb } from "@/lib/firebase.admin";
import { z } from "zod";

// Body schema (extend as needed)
const AutomationSchema = z.object({
  enabled: z.boolean().optional(),
  schedule: z.string().optional(),
});

// You likely swap this for your real auth in a follow-up pass.
function requireUid(req: NextRequest): string {
  const uid = req.headers.get("x-user-id");
  if (!uid) throw new Error("Missing user id");
  return uid;
}

export async function GET(req: NextRequest) {
  const uid = requireUid(req);
  const ref = AdminDb.doc(`users/${uid}/settings/automation`);
  const snap = await ref.get();
  return NextResponse.json(snap.exists ? snap.data() : {});
}

export async function PUT(req: NextRequest) {
  const uid = requireUid(req);
  const data = AutomationSchema.parse(await req.json());
  const ref = AdminDb.doc(`users/${uid}/settings/automation`);
  await ref.set(data, { merge: true });
  return NextResponse.json({ ok: true });
}
