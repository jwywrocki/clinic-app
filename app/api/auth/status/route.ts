import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const session = (await cookies()).get('session');
    if (session) {
        try {
            const user = JSON.parse(session.value);
            if (user.exp && user.exp > Date.now()) {
                return NextResponse.json({ isLoggedIn: true, user });
            }
        } catch {
            // ignore parse error
        }
    }
    return NextResponse.json({ isLoggedIn: false });
}
