import { type NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/users';
import { UpdateUserSchema, formatZodError } from '@/lib/schemas';
import { requireRole, isAuthError } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, 'admin');
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const userWithRole = await UserService.updateUser(id, parsed.data);
    return NextResponse.json(userWithRole);
  } catch (e: any) {
    console.error('PATCH /api/users/:id error', e);
    const isValidation = e.message?.includes('zajęta') || e.message?.includes('znaków');
    return NextResponse.json(
      { error: isValidation ? e.message : 'Błąd serwera' },
      { status: isValidation ? 400 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, 'admin');
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    await UserService.deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/users/:id error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
