// src/app/api/seed-domains/route.ts
import { NextResponse } from "next/server";
import { AdminDb } from "@/lib/firebase.admin";

export async function POST() {
  const db = AdminDb; // NOTE: no parentheses

  // Idempotent seed example. Replace with your actual domain docs.
  const marker = db.doc("meta/domains-seeded");
  const snap = await marker.get();
  if (!snap.exists) {
    await marker.set({ at: new Date().toISOString() });
  }

  return NextResponse.json({ ok: true });
}
