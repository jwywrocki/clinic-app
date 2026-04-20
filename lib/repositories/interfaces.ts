import { BaseEntity, QueryOptions, Result } from '@/domain';

export interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<Result<T | null>>;
  findAll(options?: QueryOptions): Promise<Result<T[]>>;
  create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<Result<T>>;
  update(id: string, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<Result<T>>;
  delete(id: string): Promise<Result<void>>;
  exists(id: string): Promise<Result<boolean>>;
}

export interface DoctorRepository extends Repository<import('@/domain').Doctor> {
  findBySpecialization(specialization: string): Promise<Result<import('@/domain').Doctor[]>>;
  findByCategory(category: string): Promise<Result<import('@/domain').Doctor[]>>;
  findActive(): Promise<Result<import('@/domain').Doctor[]>>;
  updateOrderPositions(
    updates: Array<{ id: string; order_position: number }>
  ): Promise<Result<void>>;
}

export interface PageRepository extends Repository<import('@/domain').Page> {
  findBySlug(slug: string): Promise<Result<import('@/domain').Page | null>>;
  findPublished(): Promise<Result<import('@/domain').Page[]>>;
  findByCategory(category?: string): Promise<Result<import('@/domain').Page[]>>;
}
