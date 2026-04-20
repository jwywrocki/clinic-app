import { NextRequest, NextResponse } from 'next/server';
import { SettingService } from '@/lib/services/settings';
import { requireRole, isAuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const setting = await SettingService.getByKey(key);
      return NextResponse.json(setting || { key, value: null });
    } else {
      const data = await SettingService.getAll();
      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authPost = await requireRole(request, 'admin');
  if (isAuthError(authPost)) return authPost;

  try {
    const body = await request.json();
    const { settings, userId } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings array is required' }, { status: 400 });
    }

    const results = await SettingService.bulkUpsert(settings, userId);

    return NextResponse.json({
      success: true,
      updated: results.length,
      settings: results,
    });
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authPut = await requireRole(request, 'admin');
  if (isAuthError(authPut)) return authPut;

  try {
    const body = await request.json();
    const { key, value, userId } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const result = await SettingService.upsert(key, value, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authDel = await requireRole(request, 'admin');
  if (isAuthError(authDel)) return authDel;

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    await SettingService.deleteByKey(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
  }
}
