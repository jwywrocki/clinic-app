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
        console.log('🛠 PATCH /api/users body:', { id, username, is_active, role, hasPassword: !!password });

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const update: any = { username, is_active, updated_at: new Date().toISOString() };
        if (password?.trim()) {
            update.password_hash = await bcrypt.hash(password + pepper, saltRounds);
        }
        console.log('🛠 PATCH /api/users payload:', update);

        const { error: upErr } = await supabase.from('users').update(update).eq('id', id);
        console.log('🛠 PATCH /api/users supabase.update result:', { upErr });
        if (upErr) throw upErr;

        if (role) {
            // Clear existing roles for user
            console.log('🛠 PATCH /api/users clearing roles for user:', id);
            await supabase.from('user_has_roles').delete().eq('user_id', id);

            // Find role by name and assign to user
            const { data: roleData, error: roleError } = await supabase.from('roles').select('id').eq('name', role).single();

            if (roleError || !roleData) {
                console.error('🛠 PATCH /api/users role not found:', role);
                throw new Error(`Role '${role}' not found`);
            }

            console.log('🛠 PATCH /api/users inserting role:', { user_id: id, role_id: roleData.id });
            const { error: rolesErr } = await supabase.from('user_has_roles').insert([{ user_id: id, role_id: roleData.id }]);
            console.log('🛠 PATCH /api/users roles insert result:', { rolesErr });
            if (rolesErr) throw rolesErr;
        }

        const { data: user, error: fetchErr } = await supabase
            .from('users')
            .select(`
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
            `)
            .eq('id', id)
            .single();
        console.log('🛠 PATCH /api/users final fetched user:', { user, fetchErr });
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
        console.log('🛠 DELETE /api/users target ID:', id);

        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const { data, error } = await supabase.from('users').delete().eq('id', id).select().single();
        console.log('🛠 DELETE /api/users supabase.delete result:', { data, error });
        if (error || !data) throw error || new Error('No user returned');

        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        console.error('DELETE /api/users/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
