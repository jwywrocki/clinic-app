import { createSupabaseClient } from '@/lib/supabase';
import type { DBClient, Id, ListOptions } from '@/lib/db/types';

export function createSupabaseDB(): DBClient {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');

  const dbClient: DBClient = {
    async list(table, options) {
      let query = supabase.from(table).select('*');
      if (options?.orderBy) {
        query = query.order(options.orderBy.column as any, {
          ascending: options.orderBy.ascending ?? true,
        });
      }
      if (options?.limit) {
        const offset = options.offset ?? 0;
        query = query.range(offset, offset + options.limit - 1);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data as any[]) ?? [];
    },

    async insert(table, data) {
      const { data: rows, error } = await supabase.from(table).insert([data]).select().single();
      if (error) throw error;
      return rows as any;
    },

    async getById(table, id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ?? null;
    },

    async updateById(table, id, update) {
      const { data, error } = await supabase
        .from(table)
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },

    async deleteById(table, id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },

    async deleteWhere(table, filters) {
      let query = supabase.from(table).delete();
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value as any);
      }
      const { error } = await query;
      if (error) throw error;
    },

    async findWhere(table, filters, options) {
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value as any);
      }
      if (options?.orderBy) {
        query = query.order(options.orderBy.column as any, {
          ascending: options.orderBy.ascending ?? true,
        });
      }
      if (options?.limit) {
        const offset = options.offset ?? 0;
        query = query.range(offset, offset + options.limit - 1);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data as any[]) ?? [];
    },

    async findOne(table, filters) {
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value as any);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      return data ?? null;
    },

    async count(table, filters) {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value as any);
        }
      }
      const { count: total, error } = await query;
      if (error) throw error;
      return total ?? 0;
    },

    async insertMany(table, dataArr) {
      const { data, error } = await supabase
        .from(table)
        .insert(dataArr as any[])
        .select();
      if (error) throw error;
      return (data as any[]) ?? [];
    },

    async upsert(table, data, conflictKeys) {
      const opts: any = {};
      if (conflictKeys && conflictKeys.length > 0) {
        opts.onConflict = conflictKeys.join(',');
      }
      const { data: rows, error } = await supabase
        .from(table)
        .upsert([data] as any[], opts)
        .select()
        .single();
      if (error) throw error;
      return rows as any;
    },

    async query(sql, params) {
      // Supabase doesn't support raw SQL easily — fall back to rpc if available
      // For most use-cases the other methods should be preferred
      throw new Error(
        'Raw SQL queries are not supported by the Supabase provider. ' +
          'Use findWhere/findOne/list methods or create an RPC function in your Supabase project.'
      );
    },

    async transaction<T>(fn: (tx: DBClient) => Promise<T>): Promise<T> {
      // The Supabase JS client does not expose client-side transaction control.
      // Operations are executed sequentially and WITHOUT atomic rollback support.
      // For true atomicity, wrap the logic in a Supabase Database Function (RPC).
      // eslint-disable-next-line no-console
      console.warn(
        '[Supabase] transaction() executes operations sequentially without rollback support. ' +
          'Use a Supabase RPC function for atomic transactions.'
      );
      return fn(dbClient);
    },
  };

  return dbClient;
}
