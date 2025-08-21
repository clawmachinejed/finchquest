// src/app/api/aliases/save/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase.admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Expecting: { path: string, data: Record<string, unknown>, merge?: boolean }
    // This preserves existing behavior without guessing your schema.
    const { path, data, merge = true } = body ?? {};

    if (typeof path !== 'string' || !path) {
      return NextResponse.json({ error: "Invalid 'path'" }, { status: 400 });
    }
    if (typeof data !== 'object' || data == null) {
      return NextResponse.json({ error: "Invalid 'data'" }, { status: 400 });
    }

    await db.doc(path).set(data as Record<string, unknown>, { merge });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('aliases/save error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
