'use server';

import { revalidatePath } from 'next/cache';
import { ContactService } from '@/lib/services/contact';
import type { ContactGroup, ContactDetail } from '@/lib/types/contact';

/**
 * Creates or updates a contact group and its details.
 * If group.id starts with "new-" (or is empty), a new group is created.
 * Otherwise the existing group is updated.
 */
export async function saveContactGroupAction(group: ContactGroup): Promise<void> {
  const isNew = !group.id || group.id.startsWith('new-');

  // Prepare group fields (strip client-only transient ids / nested details)
  const { contact_details, id, created_at, updated_at, ...groupFields } = group;

  let savedGroup: ContactGroup;

  if (isNew) {
    savedGroup = await ContactService.createGroup(groupFields);
  } else {
    savedGroup = await ContactService.updateGroup(id, groupFields);
  }

  const groupId = savedGroup.id;

  // Persist each contact detail
  if (contact_details && contact_details.length > 0) {
    for (const detail of contact_details) {
      const isNewDetail = !detail.id || detail.id.startsWith('new-');
      const { id: detailId, created_at: _ca, updated_at: _ua, ...detailFields } = detail;

      if (isNewDetail) {
        await ContactService.createDetail({
          ...detailFields,
          group_id: groupId,
        });
      } else {
        await ContactService.updateDetail(detailId, {
          ...detailFields,
          group_id: groupId,
        });
      }
    }
  }

  revalidatePath('/admin/contact');
  revalidatePath('/kontakt');
  revalidatePath('/');
}

/**
 * Deletes a contact group and all its associated details.
 */
export async function deleteContactGroupAction(groupId: string): Promise<void> {
  await ContactService.deleteGroup(groupId);
  revalidatePath('/admin/contact');
  revalidatePath('/kontakt');
  revalidatePath('/');
}

/**
 * Deletes a single contact detail.
 */
export async function deleteContactDetailAction(detailId: string, _groupId: string): Promise<void> {
  await ContactService.deleteDetail(detailId);
  revalidatePath('/admin/contact');
  revalidatePath('/kontakt');
  revalidatePath('/');
}

/**
 * Persists a new ordering of contact groups.
 */
export async function reorderContactGroupsAction(groups: ContactGroup[]): Promise<void> {
  const reordered = groups.map((g, index) => ({
    id: g.id,
    order_position: index,
  }));
  await ContactService.reorderGroups(reordered);
  revalidatePath('/admin/contact');
  revalidatePath('/kontakt');
  revalidatePath('/');
}
