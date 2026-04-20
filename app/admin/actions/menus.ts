'use server';

import { getDB } from '@/lib/db';
import { MenuItem } from '@/lib/types/menu';
import type { LoosePartial } from '@/lib/db/types';
import { revalidatePath } from 'next/cache';

export async function saveMenuAction(data: LoosePartial<MenuItem>) {
  const db = getDB();
  const userId = 'system'; // Get this from session properly in real implementation

  const payload = {
    title: data.title || '',
    url: data.url || null,
    order_position: data.order_position || 0,
    parent_id: data.parent_id ?? null,
    is_published: !!data.is_published,
    updated_at: new Date().toISOString(),
  };

  try {
    if (data.id) {
      await db.upsert('menu_items', { ...payload, id: data.id });
    } else {
      await db.upsert('menu_items', {
        ...payload,
        created_by: userId,
        created_at: new Date().toISOString(),
      });
    }
    revalidatePath('/admin/menus');
    revalidatePath('/'); // Menus can affect anywhere
    return { success: true };
  } catch (error: any) {
    console.error('Error saving menu item:', error);
    return { success: false, error: error.message };
  }
}

export async function updateMenuOrderAction(updatedItems: MenuItem[]) {
  const db = getDB();

  try {
    for (const item of updatedItems) {
      if (item.id) {
        await db.upsert('menu_items', {
          id: item.id,
          order_position: item.order_position,
          parent_id: item.parent_id ?? null,
          updated_at: new Date().toISOString(),
        });
      }
    }
    revalidatePath('/admin/menus');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating menu order:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMenuAction(id: string): Promise<void> {
  const db = getDB();
  try {
    // Najpierw usuwamy elementy podrzędne (dzieci), aby uniknąć błędów klucza obcego
    await db.deleteWhere('menu_items', { parent_id: id });
    await db.deleteById('menu_items', id);
    revalidatePath('/admin/menus');
    revalidatePath('/');
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    throw new Error(error.message);
  }
}
