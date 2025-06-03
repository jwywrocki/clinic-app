import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // Security headers
    const response = NextResponse.next();

    // CSRF Protection
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    const csp = [
        // "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        // "img-src 'self' data: blob:",
        "font-src 'self'",
        // "connect-src 'self'",
        "frame-ancestors 'none'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
