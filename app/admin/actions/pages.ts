'use server';

import { getDB } from '@/lib/db';
import { Page } from '@/lib/types/pages';
import { revalidatePath } from 'next/cache';

interface PageSpecializationLink {
  id: string;
  page_id: string;
  specialization_id: string;
}

async function syncPageSpecializations(pageId: string, specializationIds: string[]) {
  const db = getDB();
  try {
    const existing = await db.findWhere<PageSpecializationLink>('page_has_specializations', {
      page_id: pageId,
    });
    for (const link of existing) {
      await db.deleteById('page_has_specializations', link.id);
    }

    if (specializationIds.length > 0) {
      await db.insertMany(
        'page_has_specializations',
        specializationIds.map(specialization_id => ({ page_id: pageId, specialization_id }))
      );
    }
  } catch {
    // Compatibility fallback before migration.
  }
}

export async function savePageAction(data: Partial<Page>) {
  const db = getDB();

  const payload = {
    title: data.title || '',
    slug: data.slug || '',
    content: data.content || '',
    meta_description: data.meta_description || '',
    is_published: !!data.is_published,
    survey_id: data.survey_id ?? null,
  };

  const specializationIds = (data.specialization_ids || []).filter(Boolean);

  try {
    const pageId = data.id || crypto.randomUUID();
    if (data.id) {
      await db.upsert('pages', { ...payload, id: pageId, updated_at: new Date().toISOString() });
    } else {
      await db.upsert('pages', {
        ...payload,
        id: pageId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    await syncPageSpecializations(pageId, specializationIds);

    revalidatePath('/admin/pages');
    revalidatePath(`/${data.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error saving page:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePageAction(id: string): Promise<void> {
  const db = getDB();
  try {
    await db.deleteWhere('page_has_specializations', { page_id: id });
    await db.deleteById('pages', id);
    revalidatePath('/admin/pages');
  } catch (error: any) {
    console.error('Error deleting page:', error);
    throw new Error(error.message);
  }
}
