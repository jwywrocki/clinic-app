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
            const { data, error } = await supabase.from('services').select('*').eq('id', maybeId).single();

            if (error) throw error;

            return NextResponse.json(data);
        }

        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });

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

        if (!title || !description) {
            return NextResponse.json({ error: 'Brakuje title lub description' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = { title, description, is_published, created_at: now, updated_at: now };

        const { data, error } = await supabase.from('services').insert([insert]).select().single();

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

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { updated_at: new Date().toISOString() };
        if (body.title !== undefined) update.title = body.title;
        if (body.description !== undefined) update.description = body.description;
        if (body.is_published !== undefined) update.is_published = body.is_published;

        const { data, error } = await supabase.from('services').update(update).eq('id', id).select().single();

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

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('services').delete().eq('id', id).select().single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/services/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
