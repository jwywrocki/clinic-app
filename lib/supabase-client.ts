import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables not found. Running in demo mode.');
        return null;
    }

    // Validate URL format
    try {
        new URL(supabaseUrl);
    } catch (error) {
        console.error('Invalid Supabase URL format:', supabaseUrl);
        return null;
    }

    // Validate key format (basic check)
    if (supabaseAnonKey.length < 20) {
        console.error('Invalid Supabase anon key format');
        return null;
    }

    try {
        return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        return null;
    }
}
