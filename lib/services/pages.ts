import { getDB } from '@/lib/db';
import type { Page } from '@/lib/types/pages';
import type { CreatePageInput, UpdatePageInput } from '@/lib/schemas';

interface PageSpecializationLink {
  id: string;
  page_id: string;
  specialization_id: string;
}

export class PagesService {
  private static async withSpecializations(page: Page): Promise<Page> {
    const db = getDB();
    try {
      const links = await db.findWhere<PageSpecializationLink>('page_has_specializations', {
        page_id: page.id,
      });
      return {
        ...page,
        specialization_ids: links.map(link => link.specialization_id),
      };
    } catch {
      return {
        ...page,
        specialization_ids: [],
      };
    }
  }

  private static async syncPageSpecializations(pageId: string, specializationIds: string[]) {
    const db = getDB();
    try {
      const existing = await db.findWhere<PageSpecializationLink>('page_has_specializations', {
        page_id: pageId,
      });
      for (const link of existing) {
        await db.deleteById('page_has_specializations', link.id);
      }

      if (specializationIds.length === 0) return;

      const rows = specializationIds.map(specializationId => ({
        page_id: pageId,
        specialization_id: specializationId,
      }));

      await db.insertMany('page_has_specializations', rows);
    } catch {
      // Compatibility fallback before migration.
    }
  }

  static async getAll(): Promise<Page[]> {
    const db = getDB();
    const pages = await db.list<Page>('pages', {
      orderBy: { column: 'created_at', ascending: false },
    });
    return Promise.all(pages.map(page => this.withSpecializations(page)));
  }

  static async getById(id: string): Promise<Page | null> {
    const db = getDB();
    const page = await db.getById<Page>('pages', id);
    if (!page) return null;
    return this.withSpecializations(page);
  }

  static async getBySlug(slug: string): Promise<Page | null> {
    const db = getDB();
    const page = await db.findOne<Page>('pages', { slug });
    if (!page) return null;
    return this.withSpecializations(page);
  }

  static async getPublishedBySlug(slug: string): Promise<Page | null> {
    const db = getDB();
    const page = await db.findOne<Page>('pages', { slug, is_published: true });
    if (!page) return null;
    return this.withSpecializations(page);
  }

  static async create(input: CreatePageInput): Promise<Page> {
    const db = getDB();
    const now = new Date().toISOString();
    const { specialization_ids = [], ...pageData } = input;
    const page = await db.insert<Page>('pages', { ...pageData, created_at: now, updated_at: now });
    await this.syncPageSpecializations(page.id, specialization_ids);
    return this.withSpecializations(page);
  }

  static async update(id: string, input: UpdatePageInput): Promise<Page> {
    const db = getDB();
    const { specialization_ids, ...pageData } = input;
    const page = await db.updateById<Page>('pages', id, {
      ...pageData,
      updated_at: new Date().toISOString(),
    });
    if (specialization_ids) {
      await this.syncPageSpecializations(id, specialization_ids);
    }
    return this.withSpecializations(page);
  }

  static async delete(id: string): Promise<void> {
    const db = getDB();
    return db.deleteById('pages', id);
  }
}
