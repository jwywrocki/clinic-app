import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/news/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { data, error } = await supabase.from('news').select('*').eq('id', id).single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/news/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/news/[id]
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const now = new Date().toISOString();
        const updateData = {
            ...body,
            updated_at: now,
        };

        if (updateData.is_published && !updateData.published_at) {
            updateData.published_at = now;
        }

        const { data, error } = await supabase.from('news').update(updateData).eq('id', id).select().single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/news/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/news/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { error } = await supabase.from('news').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'News item deleted successfully' });
    } catch (e: any) {
        console.error('DELETE /api/news/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
