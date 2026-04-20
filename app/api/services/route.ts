import { type NextRequest, NextResponse } from 'next/server';
import { ClinicServicesService } from '@/lib/services/clinic-services';
import { CreateServiceSchema, UpdateServiceSchema, formatZodError } from '@/lib/schemas';
import { requireAuth, isAuthError } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const maybeId = parts[parts.length - 1];

    if (maybeId && maybeId !== 'services') {
      const data = await ClinicServicesService.getById(maybeId);
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(data);
    }
    const list = await ClinicServicesService.getPublished();
    return NextResponse.json(list);
  } catch (e: unknown) {
    console.error('GET /api/services error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = CreateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const created = await ClinicServicesService.create(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    console.error('POST /api/services error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id || id === 'services') {
      return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
    }
    const body = await request.json();
    const parsed = UpdateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const updated = await ClinicServicesService.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch (e: unknown) {
    console.error('PATCH /api/services/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id || id === 'services') {
      return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
    }
    await ClinicServicesService.delete(id);
    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (e: unknown) {
    console.error('DELETE /api/services/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
