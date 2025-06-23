// app/api/contact_groups/reorder/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// PATCH /api/contact_groups/reorder
export async function PATCH(request: Request) {
    try {
        const { groups } = await request.json();

        if (!Array.isArray(groups)) {
            return NextResponse.json({ error: 'Groups array is required' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Execute individual updates to only change order_position
        const updatePromises = groups.map(async (group) => {
            const { data, error } = await supabase
                .from('contact_groups')
                .update({
                    order_position: group.order_position,
                    updated_at: now,
                })
                .eq('id', group.id)
                .select('*, contact_details(*)');

            if (error) throw error;
            return data[0];
        });

        const updatedGroups = await Promise.all(updatePromises);

        return NextResponse.json(updatedGroups);
    } catch (e: any) {
        console.error('PATCH /api/contact_groups/reorder error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
