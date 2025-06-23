import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function createBackupFile(backupId: string, filename: string): Promise<void> {
    try {
        const backupsDir = path.join(process.cwd(), 'backups');
        try {
            await fs.mkdir(backupsDir, { recursive: true });
        } catch (mkdirError) {
            console.log('Backup directory already exists or created');
        }

        const filePath = path.join(backupsDir, filename);

        console.log('Creating backup using Supabase client...');

        // Create backup content using Supabase client
        let backupContent = `-- Database backup created by Supabase client on ${new Date().toISOString()}\n`;
        backupContent += `-- This is a data-only backup, schema should be restored from supabase_clinic.sql\n\n`;

        // Define tables to backup - only include tables that are likely to exist
        const tablesToBackup = [
            'users',
            'roles',
            'permissions',
            'user_has_roles',
            'site_settings',
            'contact_groups',
            'contact_details',
            'services',
            'doctors',
            'pages',
            'menu_items',
            'news',
            'surveys',
            'database_backups',
        ];

        for (const tableName of tablesToBackup) {
            try {
                console.log(`Backing up table: ${tableName}`);

                // Get all data from the table
                const { data: tableData, error } = await supabase.from(tableName).select('*');

                if (error) {
                    // Check if it's a "relation does not exist" error (table doesn't exist)
                    if (error.message.includes('relation') && error.message.includes('does not exist')) {
                        console.log(`Table ${tableName} does not exist, skipping...`);
                    } else {
                        console.warn(`Warning: Could not backup table ${tableName}:`, error.message);
                    }
                    continue;
                }

                if (!tableData || tableData.length === 0) {
                    console.log(`Table ${tableName} is empty, skipping...`);
                    continue;
                }

                // Add table section to backup
                backupContent += `-- Data for table ${tableName}\n`;
                backupContent += `TRUNCATE TABLE ${tableName} CASCADE;\n`;

                // Generate INSERT statements
                for (const row of tableData) {
                    const columns = Object.keys(row);
                    const values = columns.map((col) => {
                        const value = row[col];
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                        if (typeof value === 'boolean') return value ? 'true' : 'false';
                        if (value instanceof Date) return `'${value.toISOString()}'`;
                        return `'${value}'`;
                    });

                    backupContent += `INSERT INTO ${tableName} (${columns.map((col) => `"${col}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
                }

                backupContent += '\n';
            } catch (tableError) {
                console.warn(`Error backing up table ${tableName}:`, tableError);
            }
        }

        // Write backup file
        await fs.writeFile(filePath, backupContent, 'utf8');
        console.log('Backup file created successfully');

        // Verify file was created and has content
        const stats = await fs.stat(filePath);
        if (stats.size === 0) {
            throw new Error('Backup file is empty');
        }

        // Update backup record with success
        const { error: updateError } = await supabase
            .from('database_backups')
            .update({
                status: 'completed',
                file_size: stats.size,
                completed_at: new Date().toISOString(),
            })
            .eq('id', backupId);

        if (updateError) {
            console.error('Error updating backup record:', updateError);
        } else {
            console.log(`Backup ${backupId} completed successfully, size: ${formatBytes(stats.size)}`);
        }
    } catch (error: any) {
        console.error('Backup creation failed:', error.message);

        // Update backup record with failure
        const { error: updateError } = await supabase
            .from('database_backups')
            .update({
                status: 'failed',
                error_message: error.message,
                completed_at: new Date().toISOString(),
            })
            .eq('id', backupId);

        if (updateError) {
            console.error('Error updating failed backup record:', updateError);
        }

        throw error;
    }
}

export async function handleAutoBackup(): Promise<{ success: boolean; message: string; backup_id?: string }> {
    try {
        const { data: settings } = await supabase.from('site_settings').select('key, value').in('key', ['db_backup_enabled', 'db_backup_frequency']);

        const settingsMap =
            settings?.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {} as Record<string, string>) || {};

        if (settingsMap.db_backup_enabled !== 'true') {
            return { success: false, message: 'Automatyczne kopie zapasowe są wyłączone' };
        }

        const backupId = crypto.randomUUID();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `auto-backup-${timestamp}.sql`;

        const { data: backup, error: createError } = await supabase
            .from('database_backups')
            .insert({
                id: backupId,
                filename,
                file_path: `/backups/${filename}`,
                backup_type: 'automatic',
                status: 'in_progress',
            })
            .select('id,filename,status,created_at')
            .single();

        if (createError) {
            throw new Error(`Error creating backup record: ${createError.message}`);
        }

        await createBackupFile(backupId, filename);

        return {
            success: true,
            message: 'Automatyczna kopia zapasowa została utworzona',
            backup_id: backupId,
        };
    } catch (error: any) {
        console.error('Auto backup failed:', error);
        return { success: false, message: `Błąd automatycznej kopii zapasowej: ${error.message}` };
    }
}

export async function handleBackupCleanup(): Promise<{ success: boolean; message: string; cleaned_count?: number }> {
    try {
        const { data: settings } = await supabase.from('site_settings').select('key, value').eq('key', 'db_backup_retention_days').single();

        const retentionDays = parseInt(settings?.value || '30');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const { data: oldBackups } = await supabase.from('database_backups').select('id, filename, created_at').lt('created_at', cutoffDate.toISOString()).eq('status', 'completed');

        if (!oldBackups || oldBackups.length === 0) {
            return { success: true, message: 'Brak starych kopii zapasowych do usunięcia', cleaned_count: 0 };
        }

        let cleanedCount = 0;
        const backupsDir = path.join(process.cwd(), 'backups');

        for (const backup of oldBackups) {
            try {
                // Remove physical file
                const filePath = path.join(backupsDir, backup.filename);
                try {
                    await fs.unlink(filePath);
                    console.log(`Deleted old backup file: ${backup.filename}`);
                } catch (fileError) {
                    console.warn(`Could not delete file ${backup.filename}: ${fileError}`);
                }

                // Remove database record
                const { error: deleteError } = await supabase.from('database_backups').delete().eq('id', backup.id);
                if (deleteError) {
                    console.error(`Error deleting backup record ${backup.id}:`, deleteError);
                } else {
                    cleanedCount++;
                }
            } catch (error) {
                console.error(`Error cleaning backup ${backup.id}:`, error);
            }
        }

        return {
            success: true,
            message: `Usunięto ${cleanedCount} starych kopii zapasowych`,
            cleaned_count: cleanedCount,
        };
    } catch (error: any) {
        console.error('Backup cleanup failed:', error);
        return { success: false, message: `Błąd czyszczenia kopii zapasowych: ${error.message}` };
    }
}

export function calculateNextBackupTime(lastBackupTime: string | null, frequency: string): Date {
    const now = new Date();
    let nextBackup = new Date(now);

    if (lastBackupTime) {
        const lastBackup = new Date(lastBackupTime);
        switch (frequency) {
            case 'hourly':
                nextBackup = new Date(lastBackup.getTime() + 60 * 60 * 1000);
                break;
            case 'daily':
                nextBackup = new Date(lastBackup.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                nextBackup = new Date(lastBackup.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                nextBackup = new Date(lastBackup);
                nextBackup.setMonth(nextBackup.getMonth() + 1);
                break;
            default:
                nextBackup = new Date(lastBackup.getTime() + 24 * 60 * 60 * 1000);
        }
    } else {
        // If no last backup, next backup is in 1 hour for first time
        nextBackup.setHours(nextBackup.getHours() + 1);
    }

    return nextBackup;
}
