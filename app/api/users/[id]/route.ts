import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const pepper = process.env.BCRYPT_SECRET_KEY || '';
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// PATCH /api/users/:id
export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();
        const { username, password, is_active, role } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { username, is_active, updated_at: new Date().toISOString() };
        if (password?.trim()) {
            update.password_hash = await bcrypt.hash(password + pepper, saltRounds);
        }

        const { error: upErr } = await supabase.from('users').update(update).eq('id', id);

        if (upErr) throw upErr;

        if (role) {
            await supabase.from('user_has_roles').delete().eq('user_id', id);

            const { data: roleData, error: roleError } = await supabase.from('roles').select('id').eq('name', role).single();

            if (roleError || !roleData) {
                console.error('🛠 PATCH /api/users role not found:', role);
                throw new Error(`Role '${role}' not found`);
            }

            const { error: rolesErr } = await supabase.from('user_has_roles').insert([{ user_id: id, role_id: roleData.id }]);

            if (rolesErr) throw rolesErr;
        }

        const { data: user, error: fetchErr } = await supabase
            .from('users')
            .select(
                `
                id,
                username,
                is_active,
                created_at,
                updated_at,
                user_has_roles (
                    role:roles (
                        id,
                        name
                    )
                )
            `
            )
            .eq('id', id)
            .single();

        if (fetchErr || !user) throw fetchErr || new Error('Nie znaleziono usera');

        // Transform the user data to match the expected format
        const userWithRole = {
            ...user,
            role: (user as any).user_has_roles[0]?.role?.name || '',
        };

        return NextResponse.json(userWithRole);
    } catch (e: any) {
        console.error('PATCH /api/users/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/users/:id
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('users').delete().eq('id', id).select().single();

        if (error || !data) throw error || new Error('No user returned');

        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        console.error('DELETE /api/users/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
