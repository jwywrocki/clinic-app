import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDB } from '@/lib/db';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getPepper(): string {
  const pepper = process.env.BCRYPT_SECRET_KEY;
  if (!pepper) {
    throw new Error('BCRYPT_SECRET_KEY environment variable is required');
  }
  return pepper;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Nazwa użytkownika', type: 'text' },
        password: { label: 'Hasło', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        try {
          const db = getDB();
          const user = await db.findOne<any>('users', {
            username,
            is_active: true,
          });

          if (!user) return null;

          const passwordWithPepper = password + getPepper();
          const isPasswordValid = await bcrypt.compare(passwordWithPepper, user.password_hash);

          if (!isPasswordValid) return null;

          // Fetch role
          let role = '';
          try {
            const userRoleLink = await db.findOne<{
              user_id: string;
              role_id: string;
            }>('user_has_roles', { user_id: user.id });

            if (userRoleLink) {
              const roleRow = await db.getById<{ id: string; name: string }>(
                'roles',
                userRoleLink.role_id
              );
              role = roleRow?.name ?? '';
            }
          } catch (e) {
            console.error('Could not fetch role for user:', e);
          }

          // Update last login
          try {
            await db.updateById('users', user.id, {
              last_login: new Date().toISOString(),
            });
          } catch (e) {
            console.error('Exception during last_login update:', e);
          }

          return {
            id: user.id,
            name: user.username,
            email: user.username,
            role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
});

export interface SessionUser {
  id: string;
  username: string;
  role?: string;
}

export async function getServerSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  return {
    id: session.user.id ?? '',
    username: session.user.name ?? '',
    role: (session.user as any).role ?? '',
  };
}

export async function requireAuth(
  _request?: NextRequest | Request
): Promise<SessionUser | NextResponse> {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
  }
  return session;
}

export async function requireRole(
  _request?: NextRequest | Request,
  ...roles: string[]
): Promise<SessionUser | NextResponse> {
  const sessionOrResponse = await requireAuth(_request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const userRole = (sessionOrResponse.role ?? '').toLowerCase();
  const allowed = roles.map(r => r.toLowerCase());
  if (allowed.length > 0 && !allowed.some(r => userRole === r || userRole.startsWith(r))) {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
  }
  return sessionOrResponse;
}

export function isAuthError(result: SessionUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

export async function getSessionFromRequest(
  _request?: NextRequest | Request
): Promise<SessionUser | null> {
  return getServerSession();
}
