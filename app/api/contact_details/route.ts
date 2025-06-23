// app/api/contact_details/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const segments = url.pathname.split('/');
        const maybeId = segments[segments.length - 1];

        if (maybeId && maybeId !== 'contact_details') {
            const { data, error } = await supabase.from('contact_details').select('*').eq('id', maybeId).single();
            if (error) throw error;
            return NextResponse.json(data);
        }

        const { data, error } = await supabase.from('contact_details').select('*');
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/contact_details error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, value, group_id, order_position = 0 } = body;
        if (!type || !value) {
            return NextResponse.json({ error: 'Brakuje typu lub wartości contact_details' }, { status: 400 });
        }
        if (!group_id) {
            return NextResponse.json({ error: 'Brakuje group_id dla contact_details' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = {
            type,
            value,
            group_id,
            order_position,
            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase.from('contact_details').insert([insert]).select().single();
        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/contact_details error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { ...body, updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from('contact_details').update(update).eq('id', id).select().single();
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/contact_details/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('contact_details').delete().eq('id', id).select().single();
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/contact_details/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
