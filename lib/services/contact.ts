import { getDB } from '@/lib/db';
import { ContactGroup, ContactDetail } from '@/lib/types/contact';

export class ContactService {
  static async getAllDetails(): Promise<ContactDetail[]> {
    const db = getDB();
    return db.list<ContactDetail>('contact_details', {
      orderBy: { column: 'order_position', ascending: true },
    });
  }

  static async getDetailById(id: string): Promise<ContactDetail | null> {
    const db = getDB();
    return db.getById<ContactDetail>('contact_details', id);
  }

  static async getAllGroupsWithDetails(): Promise<ContactGroup[]> {
    const db = getDB();
    const groups = await db.findWhere<ContactGroup>(
      'contact_groups',
      {},
      { orderBy: { column: 'order_position', ascending: true } }
    );
    const allDetails = await db.findWhere<ContactDetail>(
      'contact_details',
      {},
      { orderBy: { column: 'order_position', ascending: true } }
    );

    const detailsByGroupId = allDetails.reduce(
      (acc, detail) => {
        const groupId = detail.group_id;
        if (!groupId) return acc;

        if (!acc[groupId]) {
          acc[groupId] = [];
        }
        acc[groupId].push(detail);
        return acc;
      },
      {} as Record<string, ContactDetail[]>
    );

    return groups.map(group => ({
      ...group,
      contact_details: detailsByGroupId[group.id!] || [],
    }));
  }

  static async getGroupWithDetails(groupId: string): Promise<ContactGroup | null> {
    const db = getDB();
    const group = await db.getById<ContactGroup>('contact_groups', groupId);
    if (!group) return null;

    const details = await db.findWhere<ContactDetail>(
      'contact_details',
      { group_id: groupId },
      { orderBy: { column: 'order_position', ascending: true } }
    );
    return { ...group, contact_details: details };
  }

  static async createGroup(data: Partial<ContactGroup>): Promise<ContactGroup> {
    const db = getDB();
    const now = new Date().toISOString();
    const insertData = { ...data, created_at: now, updated_at: now };

    const newGroup = await db.insert<ContactGroup>('contact_groups', insertData);
    return { ...newGroup, contact_details: [] };
  }

  static async updateGroup(id: string, data: Partial<ContactGroup>): Promise<ContactGroup> {
    const db = getDB();
    const updateData = { ...data, updated_at: new Date().toISOString() };
    await db.updateById('contact_groups', id, updateData);

    const updatedGroup = await this.getGroupWithDetails(id);
    if (!updatedGroup) throw new Error(`Contact group with id ${id} not found after update`);
    return updatedGroup;
  }

  static async createDetail(data: Partial<ContactDetail>): Promise<ContactDetail> {
    const db = getDB();
    const now = new Date().toISOString();
    const insertData = { ...data, created_at: now, updated_at: now };
    return await db.insert<ContactDetail>('contact_details', insertData);
  }

  static async updateDetail(id: string, data: Partial<ContactDetail>): Promise<ContactDetail> {
    const db = getDB();
    const updateData = { ...data, updated_at: new Date().toISOString() };
    await db.updateById('contact_details', id, updateData);
    const detail = await db.getById<ContactDetail>('contact_details', id);
    if (!detail) throw new Error(`Contact detail with id ${id} not found after update`);
    return detail;
  }

  static async deleteDetail(id: string): Promise<void> {
    const db = getDB();
    await db.deleteById('contact_details', id);
  }

  static async deleteGroup(id: string): Promise<void> {
    const db = getDB();
    const details = await db.findWhere<ContactDetail>('contact_details', { group_id: id });
    for (const detail of details) {
      if (detail.id) {
        await db.deleteById('contact_details', detail.id);
      }
    }
    await db.deleteById('contact_groups', id);
  }

  static async reorderGroups(groups: { id: string; order_position: number }[]): Promise<void> {
    const db = getDB();
    const now = new Date().toISOString();
    for (const group of groups) {
      await db.updateById('contact_groups', group.id, {
        order_position: group.order_position,
        updated_at: now,
      });
    }
  }
}
