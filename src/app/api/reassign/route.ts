// src/app/api/reassign/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase.admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Expecting: { path: string, patch: Record<string, unknown> }
    const { path, patch } = body ?? {};

    if (typeof path !== 'string' || !path) {
      return NextResponse.json({ error: "Invalid 'path'" }, { status: 400 });
    }
    if (typeof patch !== 'object' || patch == null) {
      return NextResponse.json({ error: "Invalid 'patch'" }, { status: 400 });
    }

    await db.doc(path).update(patch as Record<string, unknown>);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('reassign error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
