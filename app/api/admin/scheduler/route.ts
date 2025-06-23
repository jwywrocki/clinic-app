import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensureSchedulerInitialized } from '@/lib/scheduler-init';
import { handleAutoBackup, handleBackupCleanup, calculateNextBackupTime } from '@/lib/backup-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST - Scheduler tasks execution
export async function POST(request: NextRequest) {
    await ensureSchedulerInitialized();

    try {
        const authHeader = request.headers.get('authorization');
        const secretKey = process.env.SCHEDULER_SECRET_KEY || 'default-secret-key';

        if (authHeader !== `Bearer ${secretKey}`) {
            return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const taskType = searchParams.get('task');

        switch (taskType) {
            case 'backup':
                const backupResult = await handleAutoBackup();
                return NextResponse.json(backupResult);
            case 'cleanup':
                const cleanupResult = await handleBackupCleanup();
                return NextResponse.json(cleanupResult);
            case 'all':
                const allBackupResult = await handleAutoBackup();
                const allCleanupResult = await handleBackupCleanup();
                return NextResponse.json({
                    backup: allBackupResult,
                    cleanup: allCleanupResult,
                    message: 'Wszystkie zadania schedulera zostały wykonane',
                });
            default:
                return NextResponse.json({ error: 'Nieznany typ zadania' }, { status: 400 });
        }
    } catch (error) {
        console.error('Scheduler error:', error);
        return NextResponse.json({ error: 'Błąd wykonania zadań schedulera' }, { status: 500 });
    }
}

// GET - Scheduler status and next tasks
export async function GET() {
    await ensureSchedulerInitialized();

    try {
        const { data: settings } = await supabase.from('site_settings').select('key, value').in('key', ['db_backup_enabled', 'db_backup_frequency', 'db_backup_retention_days']);

        const settingsMap =
            settings?.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {} as Record<string, string>) || {};

        const { data: lastBackup } = await supabase.from('database_backups').select('created_at, status').eq('backup_type', 'automatic').order('created_at', { ascending: false }).limit(1).single();

        const frequency = settingsMap.db_backup_frequency || 'daily';
        const nextBackup = calculateNextBackupTime(lastBackup?.created_at, frequency);

        const retentionDays = parseInt(settingsMap.db_backup_retention_days || '30');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const { data: oldBackups } = await supabase.from('database_backups').select('id, filename, created_at').lt('created_at', cutoffDate.toISOString()).eq('status', 'completed');

        const { data: allBackups } = await supabase.from('database_backups').select('id, filename, created_at, status').order('created_at', { ascending: false });

        // Count backups by status
        const completedBackups = allBackups?.filter((backup) => backup.status === 'completed') || [];
        const failedBackups = allBackups?.filter((backup) => backup.status === 'failed') || [];
        const inProgressBackups = allBackups?.filter((backup) => backup.status === 'in_progress') || [];

        const fs = require('fs');
        const path = require('path');
        const backupsDir = path.join(process.cwd(), 'backups');
        let physicalBackupsCount = 0;

        try {
            const files = fs.readdirSync(backupsDir);
            physicalBackupsCount = files.filter((file: string) => file.endsWith('.sql')).length;
        } catch (error) {
            console.error('Error reading backups directory:', error);
        }

        return NextResponse.json({
            scheduler_status: 'active',
            backup_enabled: settingsMap.db_backup_enabled === 'true',
            backup_frequency: frequency,
            retention_days: retentionDays,
            last_backup: lastBackup
                ? {
                      created_at: lastBackup.created_at,
                      status: lastBackup.status,
                  }
                : null,
            next_backup: nextBackup,
            total_backups_count: allBackups?.length || 0,
            completed_backups_count: completedBackups.length,
            failed_backups_count: failedBackups.length,
            in_progress_backups_count: inProgressBackups.length,
            physical_backups_count: physicalBackupsCount,
            old_backups_count: oldBackups?.length || 0,
            old_backups:
                oldBackups?.map((b) => ({
                    id: b.id,
                    filename: b.filename,
                    created_at: b.created_at,
                })) || [],
        });
    } catch (error) {
        console.error('Error getting scheduler status:', error);
        return NextResponse.json({ error: 'Błąd pobierania statusu schedulera' }, { status: 500 });
    }
}

// PUT - Scheduler restart
export async function PUT(request: NextRequest) {
    await ensureSchedulerInitialized();

    try {
        const authHeader = request.headers.get('authorization');
        const secretKey = process.env.SCHEDULER_SECRET_KEY || 'default-secret-key';

        if (authHeader !== `Bearer ${secretKey}`) {
            return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
        }

        const { restartScheduler, getSchedulerStatus } = await import('@/lib/scheduler');

        await restartScheduler();

        const status = getSchedulerStatus();

        return NextResponse.json({
            success: true,
            message: 'Scheduler został zrestartowany',
            scheduler_status: status,
        });
    } catch (error) {
        console.error('Error restarting scheduler:', error);
        return NextResponse.json({ error: 'Błąd restartu schedulera' }, { status: 500 });
    }
}

function getSchedulerStatus() {
    return {
        status: 'active',
        initialized: true,
        timestamp: new Date().toISOString(),
    };
}
