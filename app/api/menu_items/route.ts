// app/api/menu_items/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/menu_items or /api/menu_items/:id
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        const maybeId = parts[parts.length - 1];

        if (maybeId && maybeId !== 'menu_items') {
            const { data, error } = await supabase.from('menu_items').select('*').eq('id', maybeId).single();
            if (error) throw error;
            return NextResponse.json(data);
        }

        const { data, error } = await supabase.from('menu_items').select('*').order('order_position', { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/menu_items error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/menu_items
export async function POST(request: Request) {
    try {
        const { title, url: link, order_position = 0, parent_id, is_published = false, created_by = null } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Brakuje title' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = {
            title,
            url: link || null,
            order_position,
            parent_id: parent_id || null,
            is_published,
            created_by,
            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase.from('menu_items').insert([insert]).select().single();
        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/menu_items error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/menu_items/:id
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
        if (body.url !== undefined) update.url = body.url || null;
        if (body.order_position !== undefined) update.order_position = body.order_position;
        if (body.parent_id !== undefined) update.parent_id = body.parent_id || null;
        if (body.is_published !== undefined) update.is_published = body.is_published;
        if (body.created_by !== undefined) update.created_by = body.created_by;

        const { data, error } = await supabase.from('menu_items').update(update).eq('id', id).select().single();
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/menu_items/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/menu_items/:id
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('menu_items').delete().eq('id', id).select().single();
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/menu_items/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
