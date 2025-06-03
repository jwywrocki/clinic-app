// app/api/doctors/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/doctors or /api/doctors/:id
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const segments = url.pathname.split('/');
        const maybeId = segments[segments.length - 1];

        // jeśli ostatni segment to nie "doctors", zwracamy pojedynczego lekarza
        if (maybeId && maybeId !== 'doctors') {
            console.log('🛠 GET /api/doctors/:id', { id: maybeId });
            const { data, error } = await supabase.from('doctors').select('*').eq('id', maybeId).single();
            console.log('🛠 supabase.select single result:', { data, error });
            if (error) throw error;
            return NextResponse.json(data);
        }

        // w przeciwnym razie zwróć wszystkich lekarzy
        console.log('🛠 GET /api/doctors all');
        const { data, error } = await supabase.from('doctors').select('*').order('name', { ascending: true });
        console.log('🛠 supabase.select all result:', { data, error });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/doctors error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/doctors
export async function POST(request: Request) {
    try {
        const { name, specialization, description = '', is_active = true } = await request.json();
        console.log('🛠 POST /api/doctors body:', { name, specialization, description, is_active });

        if (!name || !specialization) {
            return NextResponse.json({ error: 'Brakuje name lub specialization' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = {
            name,
            specialization,
            description,
            is_active,
            created_at: now,
            updated_at: now,
        };
        console.log('🛠 supabase.insert payload:', insert);

        const { data, error } = await supabase.from('doctors').insert([insert]).select().single();
        console.log('🛠 supabase.insert result:', { data, error });
        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/doctors error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/doctors/:id
export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        const { name, specialization, description, is_active } = await request.json();
        console.log('🛠 PATCH /api/doctors body:', { id, name, specialization, description, is_active });

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { updated_at: new Date().toISOString() };
        if (name !== undefined) update.name = name;
        if (specialization !== undefined) update.specialization = specialization;
        if (description !== undefined) update.description = description;
        if (is_active !== undefined) update.is_active = is_active;

        console.log('🛠 supabase.update payload:', update);
        const { data, error } = await supabase.from('doctors').update(update).eq('id', id).select().single();
        console.log('🛠 supabase.update result:', { data, error });
        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/doctors/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/doctors/:id
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        console.log('🛠 DELETE /api/doctors target ID:', id);

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('doctors').delete().eq('id', id).select().single();
        console.log('🛠 supabase.delete result:', { data, error });
        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/doctors/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
