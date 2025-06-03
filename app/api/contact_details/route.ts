// app/api/contact_details/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const segments = url.pathname.split('/');
        const maybeId = segments[segments.length - 1];

        // jeśli podano ID jako ostatni segment, zwracamy pojedynczy wpis
        if (maybeId && maybeId !== 'contact_details') {
            const { data, error } = await supabase.from('contact_details').select('*').eq('id', maybeId).single();
            if (error) throw error;
            return NextResponse.json(data);
        }

        // w przeciwnym razie zwracamy wszystkie wpisy
        const { data, error } = await supabase.from('contact_details').select('*');
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/contact_details error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Destructure group_id from the body
        const { type, value, group_id } = body;
        if (!type || !value) { // group_id can be optional if a detail can exist without a group, but for this schema it seems mandatory for new details
            return NextResponse.json({ error: 'Brakuje typu lub wartości contact_details' }, { status: 400 });
        }
        if (!group_id) { // Add check for group_id
            return NextResponse.json({ error: 'Brakuje group_id dla contact_details' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = {
            type,
            value,
            group_id, // Include group_id in the insert object
            created_at: now,
            updated_at: now,
        };
        console.log('🛠 POST /api/contact_details insert:', insert);

        const { data, error } = await supabase.from('contact_details').insert([insert]).select().single();
        console.log('🛠 POST result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/contact_details error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop(); // This PATCH is on /api/contact_details, not /api/contact_details/[id]
        const body = await request.json();
        // Destructure group_id from the body if it can be updated.
        // If group_id is part of the update, ensure it's handled.
        // const { group_id, ...restOfBody } = body; 
        console.log('🛠 PATCH /api/contact_details body:', { id, ...body });

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        // If group_id is being updated, it should be in body.
        const update: any = { ...body, updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from('contact_details').update(update).eq('id', id).select().single();
        console.log('🛠 PATCH result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/contact_details/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        console.log('🛠 DELETE /api/contact_details target ID:', id);

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('contact_details').delete().eq('id', id).select().single();
        console.log('🛠 DELETE result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/contact_details/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
