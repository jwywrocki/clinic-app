import { getDB } from '@/lib/db';
import type { MenuItem } from '@/lib/types/menu';
import type { CreateMenuItemInput, UpdateMenuItemInput } from '@/lib/schemas';
import { MenuCache } from '@/lib/menu-cache';

export class MenusService {
  static async getAll(): Promise<MenuItem[]> {
    const db = getDB();
    return db.list<MenuItem>('menu_items', {
      orderBy: { column: 'order_position', ascending: true },
    });
  }

  static async getPublished(): Promise<MenuItem[]> {
    const db = getDB();
    return db.findWhere<MenuItem>(
      'menu_items',
      { is_published: true },
      { orderBy: { column: 'order_position', ascending: true } }
    );
  }

  static async getById(id: string): Promise<MenuItem | null> {
    const db = getDB();
    return db.getById<MenuItem>('menu_items', id);
  }

  static async create(input: CreateMenuItemInput): Promise<MenuItem> {
    const db = getDB();
    const now = new Date().toISOString();
    const item = await db.insert<MenuItem>('menu_items', {
      ...input,
      created_at: now,
      updated_at: now,
    });
    MenuCache.clearCache();
    return item;
  }

  static async update(id: string, input: UpdateMenuItemInput): Promise<MenuItem> {
    const db = getDB();
    const item = await db.updateById<MenuItem>('menu_items', id, {
      ...input,
      updated_at: new Date().toISOString(),
    });
    MenuCache.clearCache();
    return item;
  }

  static async delete(id: string): Promise<void> {
    const db = getDB();
    await db.deleteById('menu_items', id);
    MenuCache.clearCache();
  }

  static async reorder(
    updates: Array<{ id: string; order_position: number; parent_id?: string | null }>
  ): Promise<void> {
    const db = getDB();
    const now = new Date().toISOString();
    await Promise.all(
      updates.map(({ id, order_position, parent_id }) =>
        db.updateById('menu_items', id, { order_position, parent_id, updated_at: now })
      )
    );
    MenuCache.clearCache();
  }
}
