import { type NextRequest, NextResponse } from 'next/server';
import { PagesService } from '@/lib/services/pages';
import { UpdatePageSchema, formatZodError } from '@/lib/schemas';
import { requireAuth, isAuthError } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await PagesService.getById(id);
    if (!data) {
      return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error('GET /api/pages/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdatePageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const data = await PagesService.update(id, parsed.data);
    return NextResponse.json(data);
  } catch (e) {
    console.error('PATCH /api/pages/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    await PagesService.delete(id);
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (e) {
    console.error('DELETE /api/pages/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
