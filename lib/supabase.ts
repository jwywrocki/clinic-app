import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient | null {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables not configured. Running in demo mode.');
        return null;
    }

    try {
        const url = new URL(supabaseUrl);

        if (!url.hostname.includes('supabase')) {
            console.error('Invalid Supabase URL format. Expected format: https://your-project.supabase.co');
            return null;
        }

        if (url.protocol !== 'https:') {
            console.error('Supabase URL must use HTTPS protocol');
            return null;
        }
    } catch (error) {
        console.error('Invalid Supabase URL format:', supabaseUrl, error);
        return null;
    }

    if (typeof supabaseAnonKey !== 'string' || supabaseAnonKey.length < 20) {
        console.error('Invalid Supabase anon key format');
        return null;
    }

    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        });

        console.log('Supabase client initialized successfully');
        return supabaseInstance;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        return null;
    }
}

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    username: string;
                    email: string;
                    password_hash: string;
                    role: 'Administrator' | 'Editor';
                    is_active: boolean;
                    last_login: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    username: string;
                    email: string;
                    password_hash: string;
                    role: 'Administrator' | 'Editor';
                    is_active?: boolean;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string;
                    email?: string;
                    password_hash?: string;
                    role?: 'Administrator' | 'Editor';
                    is_active?: boolean;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            pages: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    content: string;
                    meta_description: string | null;
                    is_published: boolean;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    content: string;
                    meta_description?: string | null;
                    is_published?: boolean;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    content?: string;
                    meta_description?: string | null;
                    is_published?: boolean;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            menu_items: {
                Row: {
                    id: string;
                    title: string;
                    url: string;
                    order_position: number;
                    parent_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    url: string;
                    order_position: number;
                    parent_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    url?: string;
                    order_position?: number;
                    parent_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            contact_info: {
                Row: {
                    id: string;
                    phone: string;
                    email: string;
                    address: string;
                    hours: string;
                    emergency_contact: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    phone: string;
                    email: string;
                    address: string;
                    hours: string;
                    emergency_contact: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    phone?: string;
                    email?: string;
                    address?: string;
                    hours?: string;
                    emergency_contact?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}

export const getSupabaseClient = () => supabaseInstance || createSupabaseClient();
