import { type NextRequest, NextResponse } from 'next/server';
import { PagesService } from '@/lib/services/pages';
import { CreatePageSchema, UpdatePageSchema, formatZodError } from '@/lib/schemas';
import { requireAuth, isAuthError } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const maybeId = parts[parts.length - 1];

    if (maybeId && maybeId !== 'pages') {
      const data = await PagesService.getById(maybeId);
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(data);
    }
    const list = await PagesService.getAll();
    return NextResponse.json(list);
  } catch (e: unknown) {
    console.error('GET /api/pages error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = CreatePageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const created = await PagesService.create(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    console.error('POST /api/pages error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id || id === 'pages') {
      return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
    }
    const body = await request.json();
    const parsed = UpdatePageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const updated = await PagesService.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch (e: unknown) {
    console.error('PATCH /api/pages/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id || id === 'pages') {
      return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
    }
    await PagesService.delete(id);
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (e: unknown) {
    console.error('DELETE /api/pages/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
