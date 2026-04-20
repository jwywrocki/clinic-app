import { type NextRequest, NextResponse } from 'next/server';
import { SurveyService } from '@/lib/services/surveys';
import { requireRole, isAuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if (isAuthError(auth)) return auth;

  try {
    const stats = await SurveyService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Surveys stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
