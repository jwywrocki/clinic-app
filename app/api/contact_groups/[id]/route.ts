// app/api/contact_groups/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/contact_groups/[id]
export async function GET(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const { data, error } = await supabase
            .from('contact_groups')
            .select('*, contact_details(*)') // Fetch group and its related details
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // PostgREST error for "Not found"
                return NextResponse.json({ error: 'Contact group not found' }, { status: 404 });
            }
            throw error;
        }
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('GET /api/contact_groups/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH /api/contact_groups/[id]
export async function PATCH(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const body = await request.json();
        const { label, featured } = body;

        if (!label && typeof featured === 'undefined') {
            return NextResponse.json({ error: 'Label or featured status is required for update' }, { status: 400 });
        }

        const updateData: { label?: string; featured?: boolean; updated_at: string } = {
            updated_at: new Date().toISOString(),
        };

        if (label) {
            updateData.label = label;
        }
        if (typeof featured !== 'undefined') {
            updateData.featured = featured;
        }

        const { data, error } = await supabase
            .from('contact_groups')
            .update(updateData)
            .eq('id', id)
            .select('*, contact_details(*)')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Contact group not found' }, { status: 404 });
            }
            throw error;
        }
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('PATCH /api/contact_groups/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/contact_groups/[id]
export async function DELETE(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = context.params;

        // Supabase will handle ON DELETE SET NULL for contact_details.group_id
        const { error } = await supabase
            .from('contact_groups')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.code === 'PGRST116') { // Should not happen if delete is successful, but good practice
                return NextResponse.json({ error: 'Contact group not found' }, { status: 404 });
            }
             // Check for foreign key violation if ON DELETE SET NULL was not correctly set up or if other constraints exist
            if (error.code === '23503') { // foreign_key_violation
                return NextResponse.json({ error: 'Cannot delete group, it is referenced by other records.' }, { status: 409 });
            }
            throw error;
        }
        return NextResponse.json({ message: 'Contact group deleted successfully' });
    } catch (e: any) {
        console.error('DELETE /api/contact_groups/:id error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
