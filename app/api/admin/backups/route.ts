import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { formatBytes, createBackupFile } from '@/lib/backup-utils';
import { requireRole, isAuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if (isAuthError(auth)) return auth;

  try {
    const db = getDB();
    const backups = await db.list<any>('database_backups', {
      orderBy: { column: 'created_at', ascending: false },
      limit: 20,
    });

    const formattedBackups =
      backups?.map((backup: any) => ({
        id: backup.id,
        created_at: backup.created_at,
        size: formatBytes(backup.file_size || 0),
        status: backup.status,
        filename: backup.filename,
        backup_type: backup.backup_type,
      })) || [];

    return NextResponse.json(formattedBackups);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Nieoczekiwany błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if (isAuthError(auth)) return auth;

  try {
    const db = getDB();
    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;

    await db.insert('database_backups', {
      id: backupId,
      filename,
      file_path: `/backups/${filename}`,
      backup_type: 'manual',
      status: 'in_progress',
    });

    // Start backup creation asynchronously
    createBackupFile(backupId, filename).catch(error => {
      console.error('Backup creation failed:', error);
    });

    return NextResponse.json({
      message: 'Kopia zapasowa została uruchomiona',
      backup_id: backupId,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Nieoczekiwany błąd serwera' }, { status: 500 });
  }
}
