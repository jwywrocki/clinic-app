// app/api/pages/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/pages or /api/pages/:id
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        const maybeId = parts[parts.length - 1];

        if (maybeId && maybeId !== 'pages') {
            console.log('🛠 GET /api/pages/:id', maybeId);
            const { data, error } = await supabase.from('pages').select('*').eq('id', maybeId).single();
            console.log('🛠 GET single result:', { data, error });
            if (error) throw error;
            return NextResponse.json(data);
        }

        console.log('🛠 GET /api/pages all');
        const { data, error } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
        console.log('🛠 GET all result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/pages error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/pages
export async function POST(request: Request) {
    try {
        const { title, slug, content, meta_description = null, is_published = false, created_by = null } = await request.json();
        console.log('🛠 POST /api/pages body:', { title, slug, is_published, meta_description, created_by });

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Brakuje title, slug lub content' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = {
            title,
            slug,
            content,
            meta_description,
            is_published,
            created_by,
            created_at: now,
            updated_at: now,
        };
        console.log('🛠 POST payload:', insert);

        const { data, error } = await supabase.from('pages').insert([insert]).select().single();
        console.log('🛠 POST result:', { data, error });
        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/pages error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/pages/:id
export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        const body = await request.json();
        console.log('🛠 PATCH /api/pages body:', { id, ...body });

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { updated_at: new Date().toISOString() };
        if (body.title !== undefined) update.title = body.title;
        if (body.slug !== undefined) update.slug = body.slug;
        if (body.content !== undefined) update.content = body.content;
        if (body.meta_description !== undefined) update.meta_description = body.meta_description;
        if (body.is_published !== undefined) update.is_published = body.is_published;
        if (body.created_by !== undefined) update.created_by = body.created_by;

        console.log('🛠 PATCH payload:', update);
        const { data, error } = await supabase.from('pages').update(update).eq('id', id).select().single();
        console.log('🛠 PATCH result:', { data, error });
        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/pages/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/pages/:id
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        console.log('🛠 DELETE /api/pages target ID:', id);

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('pages').delete().eq('id', id).select().single();
        console.log('🛠 DELETE result:', { data, error });
        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/pages/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
