import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const pepper = process.env.BCRYPT_SECRET_KEY || '';
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseServiceKey);
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();
        if (!username || !password) {
            return NextResponse.json({ error: 'Nazwa użytkownika i hasło są wymagane' }, { status: 400 });
        }

        if (supabase) {
            const { data: user, error } = await supabase.from('users').select('*').eq('username', username).eq('is_active', true).single();
            if (error || !user) {
                return NextResponse.json({ error: 'Nieprawidłowe dane logowania' }, { status: 401 });
            }

            const passwordWithPepper = password + pepper;
            const isPasswordValid = bcrypt.compareSync(passwordWithPepper, user.password_hash);

            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Nieprawidłowe dane logowania' }, { status: 401 });
            }

            const { password_hash, ...userSafe } = user;

            try {
                const { error: updateError } = await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

                if (updateError) {
                    console.error('Error updating last_login:', updateError);
                }
            } catch (e) {
                console.error('Exception during last_login update:', e);
            }

            const response = NextResponse.json({
                success: true,
                user: userSafe,
            });

            response.cookies.set(
                'session',
                JSON.stringify({
                    ...userSafe,
                    exp: Date.now() + 10 * 60 * 1000,
                }),
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 10 * 60, // 10 min
                    path: '/',
                }
            );

            return response;
        }

        return NextResponse.json({ error: 'Nieprawidłowe dane logowania' }, { status: 401 });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Wystąpił błąd serwera' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });
    return response;
}
