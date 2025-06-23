import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let isInitializing = false;

export function createSupabaseClient(): SupabaseClient | null {
    // Return existing instance if available
    if (supabaseInstance) {
        return supabaseInstance;
    }

    // Prevent multiple simultaneous initializations
    if (isInitializing) {
        return null;
    }

    isInitializing = true;

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase environment variables not configured. Running in demo mode.');
            isInitializing = false;
            return null;
        }

        try {
            const url = new URL(supabaseUrl);

            if (!url.hostname.includes('supabase')) {
                console.error('Invalid Supabase URL format. Expected format: https://your-project.supabase.co');
                isInitializing = false;
                return null;
            }

            if (url.protocol !== 'https:') {
                console.error('Supabase URL must use HTTPS protocol');
                isInitializing = false;
                return null;
            }
        } catch (error) {
            console.error('Invalid Supabase URL format:', supabaseUrl, error);
            isInitializing = false;
            return null;
        }

        if (typeof supabaseAnonKey !== 'string' || supabaseAnonKey.length < 20) {
            console.error('Invalid Supabase anon key format');
            isInitializing = false;
            return null;
        }

        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                storage: typeof window !== 'undefined' ? window.localStorage : undefined,
                storageKey: 'sb-auth-token',
            },
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
            global: {
                headers: {
                    'X-Client-Info': 'clinic-app@1.0.0',
                },
            },
        });

        isInitializing = false;
        return supabaseInstance;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        isInitializing = false;
        return null;
    }
}

export const getSupabaseClient = () => supabaseInstance || createSupabaseClient();

// Helper function to create server-side Supabase client for SSR/SSG
export function createSupabaseServer(): SupabaseClient | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables not configured for server.');
        return null;
    }

    try {
        return createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
            global: {
                headers: {
                    'X-Client-Info': 'clinic-app-server@1.0.0',
                },
            },
        });
    } catch (error) {
        console.error('Failed to initialize server Supabase client:', error);
        return null;
    }
}

// Function to reset the client instance (useful for testing or auth changes)
export function resetSupabaseClient(): void {
    supabaseInstance = null;
}
