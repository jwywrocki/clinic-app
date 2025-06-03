// app/api/pages/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/pages/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        console.log('🛠 GET /api/pages/:id', id);

        const { data, error } = await supabase.from('pages').select('*').eq('id', id).single();
        console.log('🛠 GET single result:', { data, error });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/pages/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/pages/[id]
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();

        console.log('🛠 PATCH /api/pages/:id', id, 'body:', body);

        const now = new Date().toISOString();
        const updateData = {
            ...body,
            updated_at: now,
        };

        const { data, error } = await supabase.from('pages').update(updateData).eq('id', id).select().single();

        console.log('🛠 PATCH result:', { data, error });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/pages/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/pages/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        console.log('🛠 DELETE /api/pages/:id', id);

        const { error } = await supabase.from('pages').delete().eq('id', id);
        console.log('🛠 DELETE result:', { error });

        if (error) throw error;
        return NextResponse.json({ message: 'Page deleted successfully' });
    } catch (e: any) {
        console.error('DELETE /api/pages/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
