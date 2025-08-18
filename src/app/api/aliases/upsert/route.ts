// src/app/api/aliases/upsert/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb, Timestamp } from '@/lib/firebase-server';

type Payload = {
  userId: string;            // must be the owner
  domainKey: string;         // 'guild' | 'keep' | 'forge' | 'side'
  aliasId?: string;          // optional for create
  value: string;             // alias string
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    if (!body?.userId || !body?.domainKey || !body?.value) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    const now = Timestamp.now();

    const base = adminDb
      .collection('users')
      .doc(body.userId)
      .collection('aliases')
      .doc(body.domainKey)
      .collection('entries');

    const docRef = body.aliasId ? base.doc(body.aliasId) : base.doc();

    await docRef.set(
      {
        userId: body.userId,
        domainKey: body.domainKey,
        value: body.value,
        updatedAt: now,
        createdAt: body.aliasId ? undefined : now,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (err) {
    console.error('aliases/upsert', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

