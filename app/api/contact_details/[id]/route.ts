// app/api/contact_details/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/contact_details/[id]
export async function GET(request: Request, { params: initialParams }: { params: Promise<{ id: string }> }) {
    try {
        const params = await initialParams; // Await the params object
        const { id } = params;

        const { data, error } = await supabase.from('contact_details').select('*').eq('id', id).single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/contact_details/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/contact_details/[id]
export async function PATCH(request: Request, { params: initialParams }: { params: Promise<{ id: string }> }) {
    try {
        const params = await initialParams; // Await the params object
        const { id } = params;
        const body = await request.json();

        const now = new Date().toISOString();
        const updateData = {
            ...body, // if group_id is in body, it will be included here
            updated_at: now,
        };

        const { data, error } = await supabase.from('contact_details').update(updateData).eq('id', id).select().single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/contact_details/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/contact_details/[id]
export async function DELETE(request: Request, { params: initialParams }: { params: Promise<{ id: string }> }) {
    try {
        const params = await initialParams; // Await the params object
        const { id } = params;

        const { error } = await supabase.from('contact_details').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Contact detail deleted successfully' });
    } catch (e: any) {
        console.error('DELETE /api/contact_details/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
