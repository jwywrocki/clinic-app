import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = getDB();
        const data = await db.getById('services', id);
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/services/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();

        const now = new Date().toISOString();
        const updateData = {
            ...body,
            updated_at: now,
        };
        const db = getDB();
        const data = await db.updateById('services', id, updateData);
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/services/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = getDB();
        await db.deleteById('services', id);
        return NextResponse.json({ message: 'Service deleted successfully' });
    } catch (e: any) {
        console.error('DELETE /api/services/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
