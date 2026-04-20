import { type NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact';
import { requireAuth, isAuthError } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { groups } = await request.json();
    if (!Array.isArray(groups)) {
      return NextResponse.json({ error: 'Tablica groups jest wymagana' }, { status: 400 });
    }
    await ContactService.reorderGroups(groups);
    const updatedGroups = await ContactService.getAllGroupsWithDetails();
    return NextResponse.json(updatedGroups);
  } catch (e) {
    console.error('PATCH /api/contact_groups/reorder error', e);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
