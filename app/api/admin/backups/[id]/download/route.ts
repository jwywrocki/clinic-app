import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: backupId } = await params;

        const { data: backup, error } = await supabase.from('database_backups').select('id,filename,file_path,status').eq('id', backupId).eq('status', 'completed').single();

        if (error || !backup) {
            console.error('Error fetching backup:', error);
            return NextResponse.json({ error: 'Kopia zapasowa nie została znaleziona lub nie jest gotowa' }, { status: 404 });
        }

        const backupsDir = path.join(process.cwd(), 'backups');
        const filePath = path.join(backupsDir, backup.filename);

        try {
            await fs.access(filePath);

            const fileBuffer = await fs.readFile(filePath);

            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/sql',
                    'Content-Disposition': `attachment; filename="${backup.filename}"`,
                    'Content-Length': fileBuffer.length.toString(),
                },
            });
        } catch (fileError) {
            console.log('Local file not found, trying Supabase Storage...');

            try {
                const { data: storageData, error: storageError } = await supabase.storage.from('database-backups').download(backup.filename);

                if (storageError || !storageData) {
                    console.error('Error downloading from Supabase Storage:', storageError);
                    return NextResponse.json({ error: 'Plik kopii zapasowej nie jest dostępny' }, { status: 404 });
                }

                const arrayBuffer = await storageData.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                return new NextResponse(buffer, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/sql',
                        'Content-Disposition': `attachment; filename="${backup.filename}"`,
                        'Content-Length': buffer.length.toString(),
                    },
                });
            } catch (storageError) {
                console.error('Error downloading from storage:', storageError);
                return NextResponse.json({ error: 'Błąd podczas pobierania pliku kopii zapasowej' }, { status: 500 });
            }
        }
    } catch (error) {
        console.error('Unexpected error in backup download:', error);
        return NextResponse.json({ error: 'Nieoczekiwany błąd serwera' }, { status: 500 });
    }
}
