// app/api/contact_groups/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/contact_groups
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('contact_groups')
            .select('*, contact_details(*)') // Fetch groups and their related details
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/contact_groups error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/contact_groups
export async function POST(request: Request) {
    try {
        const { label, featured = false } = await request.json();
        if (!label) {
            return NextResponse.json({ error: 'Label is required' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insertData = {
            label,
            featured,
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
