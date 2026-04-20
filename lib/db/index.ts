import { resolveProvider } from '@/lib/db/env';
import type { DBClient } from '@/lib/db/types';
import { createSupabaseDB } from '@/lib/db/providers/supabase';
import { createPostgresDB } from '@/lib/db/providers/postgres';
import { createMySQLDB } from '@/lib/db/providers/mysql';

let instance: DBClient | null = null;

export function getDB(): DBClient {
    if (instance) return instance;
    const kind = resolveProvider();
    switch (kind) {
        case 'supabase':
            instance = createSupabaseDB();
            break;
        case 'postgres':
            instance = createPostgresDB();
            break;
        case 'mysql':
            instance = createMySQLDB();
            break;
        default:
            // Postgres/MySQL providers can be added later under providers/
            instance = createSupabaseDB();
    }
    return instance;
}
