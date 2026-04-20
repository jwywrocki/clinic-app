'use server';

import { getDB } from '@/lib/db';
import { Service } from '@/lib/types/services';
import { revalidatePath } from 'next/cache';

export async function saveServiceAction(data: Partial<Service>) {
    const db = getDB();

    const payload: Record<string, any> = {
        title: data.title || '',
        description: data.description || '',
        icon: data.icon || '',
        is_published: data.is_published ?? true,
        updated_at: new Date().toISOString(),
    };

    if (data.order_position !== undefined) {
        payload.order_position = data.order_position;
    }

    try {
        // If editing an existing service and order_position changed, shift others
        if (data.id && data.order_position !== undefined) {
            const allServices = await db.list<Service>('services');
            const current = allServices.find((s: Service) => s.id === data.id);
            const oldPos = current?.order_position ?? 0;
            const newPos = data.order_position;

            if (oldPos !== newPos && oldPos > 0 && newPos > 0) {
                // Shift services between old and new positions
                for (const svc of allServices) {
                    if (svc.id === data.id) continue;
                    const pos = svc.order_position || 0;

                    if (oldPos > newPos) {
                        // Moving up: shift items in [newPos, oldPos-1] down by 1
                        if (pos >= newPos && pos < oldPos) {
                            await db.updateById('services', svc.id, {
                                order_position: pos + 1,
                                updated_at: new Date().toISOString(),
                            });
                        }
                    } else {
                        // Moving down: shift items in [oldPos+1, newPos] up by 1
                        if (pos > oldPos && pos <= newPos) {
                            await db.updateById('services', svc.id, {
                                order_position: pos - 1,
                                updated_at: new Date().toISOString(),
                            });
                        }
                    }
                }
            }
        }

        if (data.id) {
            await db.upsert('services', { ...payload, id: data.id });
        } else {
            await db.upsert('services', { ...payload, created_at: new Date().toISOString() });
        }
        revalidatePath('/admin/services');
        revalidatePath('/uslugi');
        return { success: true };
    } catch (error: any) {
        console.error('Error saving service:', error);
        return { success: false, error: error.message };
    }
}

export async function reorderServiceAction(
    serviceId: string,
    targetId: string,
    serviceNewPos: number,
    targetNewPos: number
): Promise<{ success: boolean; error?: string }> {
    const db = getDB();
    try {
        await db.updateById('services', serviceId, {
            order_position: serviceNewPos,
            updated_at: new Date().toISOString(),
        });
        await db.updateById('services', targetId, {
            order_position: targetNewPos,
            updated_at: new Date().toISOString(),
        });
        revalidatePath('/admin/services');
        revalidatePath('/uslugi');
        return { success: true };
    } catch (error: any) {
        console.error('Error reordering services:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteServiceAction(id: string): Promise<void> {
    const db = getDB();
    try {
        await db.deleteById('services', id);
        revalidatePath('/admin/services');
        revalidatePath('/uslugi');
    } catch (error: any) {
        console.error('Error deleting service:', error);
        throw new Error(error.message);
    }
}

