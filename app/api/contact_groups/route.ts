import { type NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact';
import { CreateContactGroupSchema, formatZodError } from '@/lib/schemas';
import { requireAuth, isAuthError } from '@/lib/auth';

export async function GET() {
  try {
    const groupsWithDetails = await ContactService.getAllGroupsWithDetails();
    return NextResponse.json(groupsWithDetails, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
  } catch (e) {
    console.error('GET /api/contact_groups error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = CreateContactGroupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error.issues) }, { status: 400 });
    }
    const groupWithDetails = await ContactService.createGroup(parsed.data);
    return NextResponse.json(groupWithDetails, { status: 201 });
  } catch (e) {
    console.error('POST /api/contact_groups error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
