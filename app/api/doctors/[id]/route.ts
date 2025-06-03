// app/api/doctors/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/doctors/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        console.log('🛠 GET /api/doctors/:id', id);

        const { data, error } = await supabase.from('doctors').select('*').eq('id', id).single();
        console.log('🛠 GET single result:', { data, error });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/doctors/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/doctors/[id]
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();

        console.log('🛠 PATCH /api/doctors/:id', id, 'body:', body);

        const now = new Date().toISOString();
        const updateData = {
            ...body,
            updated_at: now,
        };

        const { data, error } = await supabase.from('doctors').update(updateData).eq('id', id).select().single();

        console.log('🛠 PATCH result:', { data, error });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/doctors/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/doctors/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        console.log('🛠 DELETE /api/doctors/:id', id);

        const { error } = await supabase.from('doctors').delete().eq('id', id);
        console.log('🛠 DELETE result:', { error });

        if (error) throw error;
        return NextResponse.json({ message: 'Doctor deleted successfully' });
    } catch (e: any) {
        console.error('DELETE /api/doctors/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
