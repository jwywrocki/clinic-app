import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { formatBytes, createBackupFile } from '@/lib/backup-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Backup list
export async function GET() {
    try {
        const { data: backups, error } = await supabase.from('database_backups').select('id,filename,file_size,status,backup_type,created_at').order('created_at', { ascending: false }).limit(20);

        if (error) {
            console.error('Error fetching backups:', error);
            return NextResponse.json({ error: 'Błąd podczas pobierania listy kopii zapasowych' }, { status: 500 });
        }

        const formattedBackups =
            backups?.map((backup) => ({
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

// POST - Create new backup
export async function POST(request: NextRequest) {
    try {
        const backupId = crypto.randomUUID();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;

        const { data: backup, error: createError } = await supabase
            .from('database_backups')
            .insert({
                id: backupId,
                filename,
                file_path: `/backups/${filename}`,
                backup_type: 'manual',
                status: 'in_progress',
            })
            .select('id,filename,status,created_at')
            .single();

        if (createError) {
            console.error('Error creating backup record:', createError);
            return NextResponse.json({ error: 'Błąd podczas tworzenia rekordu kopii zapasowej' }, { status: 500 });
        }

        // Start backup creation asynchronously
        createBackupFile(backupId, filename).catch((error) => {
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
