import { type NextRequest, NextResponse } from 'next/server';
import { MenusService } from '@/lib/services/menus';
import { CreateMenuItemSchema, UpdateMenuItemSchema, formatZodError } from '@/lib/schemas';
import { requireAuth, isAuthError } from '@/lib/auth';

export async function GET() {
  try {
    const list = await MenusService.getPublished();
    return NextResponse.json(list);
  } catch (e) {
    console.error('GET /api/menu_items error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = CreateMenuItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const created = await MenusService.create(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('POST /api/menu_items error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id || id === 'menu_items') {
      return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
    }
    const body = await request.json();
    const parsed = UpdateMenuItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const updated = await MenusService.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch (e) {
    console.error('PATCH /api/menu_items error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id || id === 'menu_items') {
      return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
    }
    await MenusService.delete(id);
    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (e) {
    console.error('DELETE /api/menu_items error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
