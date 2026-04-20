'use server';

import { getDB } from '@/lib/db';
import { NewsItem } from '@/lib/types/news';
import { revalidatePath } from 'next/cache';

export async function saveNewsAction(data: Partial<NewsItem>) {
  const db = getDB();

  const now = new Date().toISOString();
  const payload: Record<string, any> = {
    title: data.title || '',
    content: data.content || '',
    image_url: data.image_url || null,
    excerpt: data.excerpt || null,
    is_published: !!data.is_published,
    published_at: data.is_published ? data.published_at || now : null,
    updated_at: now,
  };

  try {
    if (data.id) {
      await db.upsert('news', { ...payload, id: data.id });
    } else {
      await db.upsert('news', { ...payload, created_at: now });
    }
    revalidatePath('/admin/news');
    revalidatePath('/');
    revalidatePath('/aktualnosci');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving news:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteNewsAction(id: string): Promise<void> {
  const db = getDB();
  try {
    await db.deleteWhere('news_has_category', { news_id: id });
    await db.deleteById('news', id);
    revalidatePath('/admin/news');
    revalidatePath('/');
    revalidatePath('/aktualnosci');
  } catch (error: any) {
    console.error('Error deleting news:', error);
    throw new Error(error.message);
  }
}
