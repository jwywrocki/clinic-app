import { getDB } from '@/lib/db';
import type { NewsItem } from '@/lib/types/news';
import type { CreateNewsInput, UpdateNewsInput } from '@/lib/schemas';

export class NewsService {
  static async getAll(): Promise<NewsItem[]> {
    const db = getDB();
    return db.list<NewsItem>('news', { orderBy: { column: 'published_at', ascending: false } });
  }

  static async getPublished(): Promise<NewsItem[]> {
    const db = getDB();
    const now = new Date().toISOString();
    const allPublished = await db.findWhere<NewsItem>(
      'news',
      { is_published: true },
      { orderBy: { column: 'published_at', ascending: false } }
    );
    return allPublished.filter(n => !n.published_at || n.published_at <= now);
  }

  static async getById(id: string): Promise<NewsItem | null> {
    const db = getDB();
    return db.getById<NewsItem>('news', id);
  }

  static async create(input: CreateNewsInput): Promise<NewsItem> {
    const db = getDB();
    const now = new Date().toISOString();
    return db.insert<NewsItem>('news', { ...input, created_at: now, updated_at: now });
  }

  static async update(id: string, input: UpdateNewsInput): Promise<NewsItem> {
    const db = getDB();
    return db.updateById<NewsItem>('news', id, { ...input, updated_at: new Date().toISOString() });
  }

  static async delete(id: string): Promise<void> {
    const db = getDB();
    return db.deleteById('news', id);
  }
}
