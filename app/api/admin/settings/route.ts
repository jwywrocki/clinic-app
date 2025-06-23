import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { safeEncryptPassword } from '@/lib/crypto';

export async function GET(request: NextRequest) {
    try {
        const supabase = createSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (key) {
            const { data, error } = await supabase
                .from('site_settings')
                .select(
                    `
                    *,
                    created_by_user:created_by(username),
                    updated_by_user:updated_by(username)
                `
                )
                .eq('key', key)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return NextResponse.json(data || { key, value: null });
        } else {
            const { data, error } = await supabase
                .from('site_settings')
                .select(
                    `
                    *,
                    created_by_user:created_by(username),
                    updated_by_user:updated_by(username)
                `
                )
                .order('key');

            if (error) {
                throw error;
            }

            return NextResponse.json(data || []);
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const body = await request.json();
        const { settings, userId } = body;

        if (!settings || !Array.isArray(settings)) {
            return NextResponse.json({ error: 'Settings array is required' }, { status: 400 });
        }

        const results = [];

        for (const setting of settings) {
            const { key, value, description } = setting;

            if (!key) {
                continue;
            }

            // Encrypt sensitive data (SMTP passwords) before saving
            let processedValue = value;
            if (key === 'email_smtp_password' && value) {
                processedValue = safeEncryptPassword(value);
            }

            try {
                const { data: existingSetting } = await supabase.from('site_settings').select('id').eq('key', key).single();

                let result;
                if (existingSetting) {
                    const { data, error } = await supabase
                        .from('site_settings')
                        .update({
                            value: processedValue,
                            description,
                            updated_by: userId || null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('key', key)
                        .select()
                        .single();

                    if (error) throw error;
                    result = data;
                } else {
                    const { data, error } = await supabase
                        .from('site_settings')
                        .insert({
                            key,
                            value: processedValue,
                            description,
                            created_by: userId || null,
                            updated_by: userId || null,
                        })
                        .select()
                        .single();

                    if (error) throw error;
                    result = data;
                }

                results.push(result);
            } catch (settingError) {
                console.error(`Error processing setting ${key}:`, settingError);
            }
        }

        return NextResponse.json({
            success: true,
            updated: results.length,
            settings: results,
        });
    } catch (error) {
        console.error('Error bulk updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = createSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const body = await request.json();
        const { key, value, userId } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        // Encrypt sensitive data (SMTP passwords) before saving
        let processedValue = value;
        if (key === 'email_smtp_password' && value) {
            processedValue = safeEncryptPassword(value);
        }

        const { data: existingSetting } = await supabase.from('site_settings').select('id').eq('key', key).single();

        let result;
        if (existingSetting) {
            const { data, error } = await supabase
                .from('site_settings')
                .update({
                    value: processedValue,
                    updated_by: userId || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('key', key)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('site_settings')
                .insert({
                    key,
                    value: processedValue,
                    created_by: userId || null,
                    updated_by: userId || null,
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = createSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const { error } = await supabase.from('site_settings').delete().eq('key', key);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting setting:', error);
        return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
    }
}
