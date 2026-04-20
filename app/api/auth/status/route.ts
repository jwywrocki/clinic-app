import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (session?.user) {
    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: session.user.id,
        username: session.user.name,
        role: (session.user as any).role ?? '',
      },
    });
  }
  return NextResponse.json({ isLoggedIn: false });
}
