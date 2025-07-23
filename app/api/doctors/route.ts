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

        if (maybeId && maybeId !== 'doctors') {
            const { data, error } = await supabase.from('doctors').select('*').eq('id', maybeId).single();
            if (error) throw error;
            return NextResponse.json(data);
        }

        const { data, error } = await supabase.from('doctors').select('*').order('last_name', { ascending: true });

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
        const { first_name, last_name, specialization, bio = '', image_url = '', schedule = '', is_active = true, order_position = 1, menu_category = 'lekarze' } = await request.json();

        if (!first_name || !last_name || !specialization) {
            return NextResponse.json({ error: 'Brakuje first_name, last_name lub specialization' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const insert = {
            first_name,
            last_name,
            specialization,
            bio,
            image_url,
            schedule: schedule || '',
            is_active,
            order_position,
            menu_category,
            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase.from('doctors').insert([insert]).select().single();

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
        const { first_name, last_name, specialization, bio, image_url, schedule, is_active, order_position, menu_category } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { updated_at: new Date().toISOString() };
        if (first_name !== undefined) update.first_name = first_name;
        if (last_name !== undefined) update.last_name = last_name;
        if (specialization !== undefined) update.specialization = specialization;
        if (bio !== undefined) update.bio = bio;
        if (image_url !== undefined) update.image_url = image_url;
        if (schedule !== undefined) update.schedule = schedule;
        if (is_active !== undefined) update.is_active = is_active;
        if (order_position !== undefined) update.order_position = order_position;
        if (menu_category !== undefined) update.menu_category = menu_category;

        const { data, error } = await supabase.from('doctors').update(update).eq('id', id).select().single();

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

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('doctors').delete().eq('id', id).select().single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('DELETE /api/doctors/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
