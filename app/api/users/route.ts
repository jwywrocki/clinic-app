import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const pepper = process.env.BCRYPT_SECRET_KEY || '';
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// GET /api/users
export async function GET() {
    try {
        const { data: users, error } = await supabase.from('users').select(`
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
      `);

        if (error) throw error;
        return NextResponse.json(users);
    } catch (e: any) {
        console.error('GET /api/users error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/users
export async function POST(request: Request) {
    try {
        const { username, password, is_active, role } = await request.json();
        if (!username || !password) {
            return NextResponse.json({ error: 'Brak username lub password' }, { status: 400 });
        }

        const hash = await bcrypt.hash(password + pepper, saltRounds);
        const now = new Date().toISOString();

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ username, password_hash: hash, is_active, created_at: now, updated_at: now }])
            .select()
            .single();
        if (error || !user) throw error || new Error('No user returned');

        if (role) {
            const { data: roleData, error: roleError } = await supabase.from('roles').select('id').eq('name', role).single();

            if (roleError || !roleData) {
                console.error('🛠 POST /api/users role not found:', role);
                throw new Error(`Role '${role}' not found`);
            }

            const { error: rolesErr } = await supabase.from('user_has_roles').insert([{ user_id: user.id, role_id: roleData.id }]);
            if (rolesErr) throw rolesErr;
        }

        const { data: completeUser, error: fetchErr } = await supabase
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
            .eq('id', user.id)
            .single();

        if (fetchErr || !completeUser) {
            console.error('🛠 POST /api/users failed to fetch complete user:', fetchErr);

            const userWithRole = { ...user, role: role || '' };
            return NextResponse.json(userWithRole, { status: 201 });
        }

        const userWithRole = {
            ...completeUser,
            role: (completeUser as any).user_has_roles[0]?.role?.name || '',
        };

        return NextResponse.json(userWithRole, { status: 201 });
    } catch (e: any) {
        console.error('POST /api/users error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
