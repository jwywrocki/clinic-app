import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const db = getDB();
    const data = await db.getById('doctors', id);
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('GET /api/doctors/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = params;
    const body = await request.json();

    const now = new Date().toISOString();
    const updateData = {
      ...body,
      ...(body.description !== undefined ? { bio: body.description } : {}),
      updated_at: now,
    };
    if (updateData.description !== undefined) delete updateData.description;
    const db = getDB();
    const data = await db.updateById('doctors', id, updateData);
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('PATCH /api/doctors/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = params;
    const db = getDB();
    await db.deleteById('doctors', id);
    return NextResponse.json({ message: 'Doctor deleted successfully' });
  } catch (e: any) {
    console.error('DELETE /api/doctors/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
