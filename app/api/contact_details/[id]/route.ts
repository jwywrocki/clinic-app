import { type NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact';
import { UpdateContactDetailSchema, formatZodError } from '@/lib/schemas';
import { requireAuth, isAuthError } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await ContactService.getDetailById(id);
    if (!data) {
      return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error('GET /api/contact_details/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateContactDetailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const updateData = { ...parsed.data };
    const data = await ContactService.updateDetail(id, updateData);
    return NextResponse.json(data);
  } catch (e) {
    console.error('PATCH /api/contact_details/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    await ContactService.deleteDetail(id);
    return NextResponse.json({ message: 'Contact detail deleted successfully' });
  } catch (e) {
    console.error('DELETE /api/contact_details/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
