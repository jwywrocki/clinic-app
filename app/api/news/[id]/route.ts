import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = getDB();
        const data = await db.getById('news', id);
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/news/:id error', e);
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

        if ((updateData as any).is_published && !(updateData as any).published_at) {
            updateData.published_at = now;
        }
        const db = getDB();
        const data = await db.updateById('news', id, updateData);
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/news/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = getDB();
        await db.deleteById('news', id);
        return NextResponse.json({ message: 'News item deleted successfully' });
    } catch (e: any) {
        console.error('DELETE /api/news/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
