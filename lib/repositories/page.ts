import { Page, Result } from '@/domain';
import { PageRepository } from './interfaces';
import { BaseRepository } from './base';
import { DBClient } from '@/lib/db/types';

export class PageRepositoryImpl extends BaseRepository<Page> implements PageRepository {
  constructor(db: DBClient) {
    super(db, 'pages');
  }

  async findBySlug(slug: string): Promise<Result<Page | null>> {
    return this.findOne('slug', slug);
  }

  async findPublished(): Promise<Result<Page[]>> {
    return this.findByField('is_published', true, {
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findByCategory(category?: string): Promise<Result<Page[]>> {
    return this.findAll({
      orderBy: { column: 'created_at', ascending: false },
    });
  }
}
