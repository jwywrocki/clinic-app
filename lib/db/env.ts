export type ProviderKind = 'supabase' | 'postgres' | 'mysql';

export function resolveProvider(): ProviderKind {
  const explicit = process.env.DB_CONNECTION?.toLowerCase();
  if (
    explicit === 'postgres' ||
    explicit === 'pgsql' ||
    explicit === 'postgre' ||
    explicit === 'postgresql'
  )
    return 'postgres';
  if (explicit === 'mysql' || explicit === 'mariadb') return 'mysql';
  if (explicit === 'supabase') return 'supabase';

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    return 'supabase';

  if (process.env.DATABASE_URL?.includes('postgres') || process.env.POSTGRES_URL) return 'postgres';
  if (process.env.MYSQL_URL) return 'mysql';

  return 'supabase';
}
