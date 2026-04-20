import { type NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/users';
import { CreateUserSchema, formatZodError } from '@/lib/schemas';
import { requireRole, isAuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if (isAuthError(auth)) return auth;

  try {
    const usersWithRoles = await UserService.getAllUsersWithRoles();
    return NextResponse.json(usersWithRoles);
  } catch (e) {
    console.error('GET /api/users error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const completeUser = await UserService.createUser(parsed.data);
    return NextResponse.json(completeUser, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/users error', e);
    const isValidation = e.message?.includes('zajęta') || e.message?.includes('znaków');
    return NextResponse.json(
      { error: isValidation ? e.message : 'Błąd serwera' },
      { status: isValidation ? 400 : 500 }
    );
  }
}
