import { type NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_LOGIN_ATTEMPTS;
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const isDev = process.env.NODE_ENV === 'development';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  if (!isDev) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export default auth(function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rate limit login
  if (pathname === '/api/auth' && request.method === 'POST') {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      const response = NextResponse.json(
        { error: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.' },
        { status: 429 }
      );
      return applySecurityHeaders(response);
    }
  }

  // Rate limit contact form
  if (pathname === '/api/contact/send' && request.method === 'POST') {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      const response = NextResponse.json(
        { error: 'Zbyt wiele wiadomości. Spróbuj ponownie później.' },
        { status: 429 }
      );
      return applySecurityHeaders(response);
    }
  }

  // Protect admin routes
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isWriteApiMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const isProtectedApi =
    isWriteApiMethod &&
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/public') &&
    !pathname.startsWith('/api/contact/send');

  if (isAdminRoute || isAdminApi || isProtectedApi) {
    if (!request.auth?.user) {
      if (pathname.startsWith('/api/')) {
        const response = NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
        return applySecurityHeaders(response);
      }
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
});

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder images
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
