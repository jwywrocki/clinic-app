'use client';

import { createClient } from '@supabase/supabase-js';

// Safe Supabase client initialization with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
    }
}

interface AuditLogEntry {
    user_id?: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    details?: Record<string, any>;
    ip_address?: string;
}

export class AuditLogger {
    static async log(entry: AuditLogEntry) {
        try {
            if (!supabase) return;

            const { error } = await supabase.from('audit_logs').insert({
                user_id: entry.user_id,
                action: entry.action,
                entity_type: entry.entity_type,
                entity_id: entry.entity_id,
                details: entry.details,
                ip_address: entry.ip_address || 'unknown',
                created_at: new Date().toISOString(),
            });

            if (error) {
                console.error('Failed to log audit entry:', error);
            }
        } catch (error) {
            console.error('Audit logging error:', error);
        }
    }

    static async logUserAction(userId: string, action: string, details?: Record<string, any>) {
        await this.log({
            user_id: userId,
            action,
            entity_type: 'user',
            details,
        });
    }

    static async logPageAction(userId: string, action: string, pageId: string, details?: Record<string, any>) {
        await this.log({
            user_id: userId,
            action,
            entity_type: 'page',
            entity_id: pageId,
            details,
        });
    }

    static async logMenuAction(userId: string, action: string, menuId: string, details?: Record<string, any>) {
        await this.log({
            user_id: userId,
            action,
            entity_type: 'menu_item',
            entity_id: menuId,
            details,
        });
    }

    static async logContactAction(userId: string, action: string, details?: Record<string, any>) {
        await this.log({
            user_id: userId,
            action,
            entity_type: 'contact_info',
            details,
        });
    }
}
