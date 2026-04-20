import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { requireAuth, isAuthError, getSessionFromRequest } from '@/lib/auth';
import { type NextRequest } from 'next/server';
import { Specialization } from '@/lib/types/specializations';

export async function GET(request: Request) {
  try {
    const db = getDB();

    const session = await getSessionFromRequest(request);
    const onlyPublishedLike = !session;

    const list = await db.list<Specialization>('specializations', {
      orderBy: { column: 'name', ascending: true },
    });

    return NextResponse.json(onlyPublishedLike ? list : { data: list });
  } catch (e) {
    console.error('GET /api/specializations error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const description = body?.description ? String(body.description).trim() : null;

    if (!name) {
      return NextResponse.json({ error: 'Nazwa jest wymagana' }, { status: 400 });
    }

    const db = getDB();
    const existing = await db.findOne<Specialization>('specializations', { name });
    if (existing) {
      return NextResponse.json({ error: 'Specjalizacja już istnieje' }, { status: 409 });
    }

    const created = await db.insert<Specialization>('specializations', {
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('POST /api/specializations error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
