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
            console.log('🛠 GET /api/menu_items/:id', maybeId);
            const { data, error } = await supabase.from('menu_items').select('*').eq('id', maybeId).single();
            console.log('🛠 GET single result:', { data, error });
            if (error) throw error;
            return NextResponse.json(data);
        }

        console.log('🛠 GET /api/menu_items all');
        const { data, error } = await supabase.from('menu_items').select('*').order('order_position', { ascending: true });
        console.log('🛠 GET all result:', { data, error });
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
        const { title, url: link, order_position = 0, parent_id = null, is_published = false, created_by = null } = await request.json();
        console.log('🛠 POST /api/menu_items body:', { title, link, order_position, parent_id, is_published, created_by });

        if (!title || !link) {
            return NextResponse.json({ error: 'Brakuje title lub url' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = {
            title,
            url: link,
            order_position,
            parent_id,
            is_published,
            created_by,
            created_at: now,
            updated_at: now,
        };
        console.log('🛠 POST payload:', insert);

        const { data, error } = await supabase.from('menu_items').insert([insert]).select().single();
        console.log('🛠 POST result:', { data, error });
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
        console.log('🛠 PATCH /api/menu_items body:', { id, ...body });

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { updated_at: new Date().toISOString() };
        if (body.title !== undefined) update.title = body.title;
        if (body.url !== undefined) update.url = body.url;
        if (body.order_position !== undefined) update.order_position = body.order_position;
        if (body.parent_id !== undefined) update.parent_id = body.parent_id;
        if (body.is_published !== undefined) update.is_published = body.is_published;
        if (body.created_by !== undefined) update.created_by = body.created_by;

        console.log('🛠 PATCH payload:', update);
        const { data, error } = await supabase.from('menu_items').update(update).eq('id', id).select().single();
        console.log('🛠 PATCH result:', { data, error });
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
        console.log('🛠 DELETE /api/menu_items target ID:', id);

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('menu_items').delete().eq('id', id).select().single();
        console.log('🛠 DELETE result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/menu_items/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
