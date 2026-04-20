import { type NextRequest, NextResponse } from 'next/server';
import { signIn, signOut } from '@/lib/auth';

/**
 * Legacy /api/auth endpoint — bridges the login page to Auth.js.
 * The login page POSTs { username, password } here.
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Nazwa użytkownika i hasło są wymagane' }, { status: 400 });
    }

    try {
      await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
    } catch (error: any) {
      // Auth.js throws on failed credentials
      if (error?.type === 'CredentialsSignin' || error?.message?.includes('CredentialsSignin')) {
        return NextResponse.json({ error: 'Nieprawidłowe dane logowania' }, { status: 401 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Wystąpił błąd serwera' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await signOut({ redirect: false });
  } catch {
    // signOut may throw in some cases; cookie is cleared by Auth.js
  }
  return NextResponse.json({ success: true });
}
