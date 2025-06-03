// app/api/services/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/services or /api/services/:id
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        const maybeId = parts[parts.length - 1];

        if (maybeId && maybeId !== 'services') {
            console.log('🛠 GET /api/services/:id', maybeId);
            const { data, error } = await supabase.from('services').select('*').eq('id', maybeId).single();
            console.log('🛠 GET single result:', { data, error });
            if (error) throw error;
            return NextResponse.json(data);
        }

        console.log('🛠 GET /api/services all');
        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        console.log('🛠 GET all result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/services error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/services
export async function POST(request: Request) {
    try {
        const { title, description = '', is_published = false } = await request.json();
        console.log('🛠 POST /api/services body:', { title, description, is_published });

        if (!title || !description) {
            return NextResponse.json({ error: 'Brakuje title lub description' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = { title, description, is_published, created_at: now, updated_at: now };
        console.log('🛠 POST payload:', insert);

        const { data, error } = await supabase.from('services').insert([insert]).select().single();
        console.log('🛠 POST result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/services error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/services/:id
export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        const body = await request.json();
        console.log('🛠 PATCH /api/services body:', { id, ...body });

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { updated_at: new Date().toISOString() };
        if (body.title !== undefined) update.title = body.title;
        if (body.description !== undefined) update.description = body.description;
        if (body.is_published !== undefined) update.is_published = body.is_published;

        console.log('🛠 PATCH payload:', update);
        const { data, error } = await supabase.from('services').update(update).eq('id', id).select().single();
        console.log('🛠 PATCH result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/services/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/services/:id
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        console.log('🛠 DELETE /api/services target ID:', id);

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('services').delete().eq('id', id).select().single();
        console.log('🛠 DELETE result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/services/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
