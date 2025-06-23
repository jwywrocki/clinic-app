// app/api/news/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/news or /api/news/:id
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        const maybeId = parts[parts.length - 1];

        if (maybeId && maybeId !== 'news') {
            const { data, error } = await supabase.from('news').select('*').eq('id', maybeId).single();

            if (error) throw error;

            return NextResponse.json(data);
        }

        const { data, error } = await supabase.from('news').select('*').order('published_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/news error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/news
export async function POST(request: Request) {
    try {
        const { title, slug, content, published_at = null, is_published = false, created_by = null } = await request.json();

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Brakuje title, slug lub content' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = {
            title,
            slug,
            content,
            published_at,
            is_published,
            created_by,
            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase.from('news').insert([insert]).select().single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/news error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/news/:id
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
        if (body.slug !== undefined) update.slug = body.slug;
        if (body.content !== undefined) update.content = body.content;
        if (body.published_at !== undefined) update.published_at = body.published_at;
        if (body.is_published !== undefined) update.is_published = body.is_published;
        if (body.created_by !== undefined) update.created_by = body.created_by;

        const { data, error } = await supabase.from('news').update(update).eq('id', id).select().single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/news/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/news/:id
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('news').delete().eq('id', id).select().single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/news/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
