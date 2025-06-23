// app/api/contact_groups/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/contact_groups
export async function GET() {
    try {
        const { data, error } = await supabase.from('contact_groups').select('*, contact_details(*)').order('order_position', { ascending: true });

        if (error) {
            console.error('[GET /api/contact_groups] Supabase error:', error);
            throw error;
        }

        return NextResponse.json(data, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (e: any) {
        console.error('GET /api/contact_groups error', e);
        return NextResponse.json(
            { error: e.message },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

// OPTIONS /api/contact_groups (for CORS preflight)
export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        }
    );
}

// POST /api/contact_groups
export async function POST(request: Request) {
    try {
        const { label, in_hero = false, in_footer = true, order_position } = await request.json();
        if (!label) {
            return NextResponse.json({ error: 'Label is required' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insertData = {
            label,
            in_hero,
            in_footer,
            order_position,
            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase.from('contact_groups').insert([insertData]).select('*, contact_details(*)').single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/contact_groups error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
