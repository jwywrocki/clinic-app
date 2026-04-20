import { BaseEntity, QueryOptions, Result, success, failure, DomainError } from '@/domain';
import { Repository } from './interfaces';
import { DBClient } from '@/lib/db/types';

export abstract class BaseRepository<T extends BaseEntity> implements Repository<T> {
  constructor(
    protected db: DBClient,
    protected tableName: string
  ) {}

  async findById(id: string): Promise<Result<T | null>> {
    try {
      const entity = await this.db.getById<T>(this.tableName, id);
      return success(entity);
    } catch (error) {
      return failure(new DomainError(
        `Failed to find ${this.tableName} by id: ${id}`,
        'DATABASE_ERROR',
        error
      ));
    }
  }

  async findAll(options?: QueryOptions): Promise<Result<T[]>> {
    try {
      const listOptions = options?.orderBy ? { orderBy: options.orderBy } : undefined;
      const entities = await this.db.list<T>(this.tableName, listOptions);
      return success(entities);
    } catch (error) {
      return failure(new DomainError(
        `Failed to find all ${this.tableName}`,
        'DATABASE_ERROR',
        error
      ));
    }
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<Result<T>> {
    try {
      const now = new Date().toISOString();
      const entityData = {
        ...data,
        created_at: now,
        updated_at: now,
      } as Partial<T>;
      
      const entity = await this.db.insert<T>(this.tableName, entityData);
      return success(entity);
    } catch (error) {
      return failure(new DomainError(
        `Failed to create ${this.tableName}`,
        'DATABASE_ERROR',
        error
      ));
    }
  }

  async update(id: string, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<Result<T>> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      } as Partial<T>;
      
      const entity = await this.db.updateById<T>(this.tableName, id, updateData);
      return success(entity);
    } catch (error) {
      return failure(new DomainError(
        `Failed to update ${this.tableName} with id: ${id}`,
        'DATABASE_ERROR',
        error
      ));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.db.deleteById(this.tableName, id);
      return success(undefined);
    } catch (error) {
      return failure(new DomainError(
        `Failed to delete ${this.tableName} with id: ${id}`,
        'DATABASE_ERROR',
        error
      ));
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const entity = await this.db.getById<T>(this.tableName, id);
      return success(entity !== null);
    } catch (error) {
      return failure(new DomainError(
        `Failed to check existence of ${this.tableName} with id: ${id}`,
        'DATABASE_ERROR',
        error
      ));
    }
  }

  protected async findByField<K extends keyof T>(
    field: K,
    value: T[K],
    options?: QueryOptions
  ): Promise<Result<T[]>> {
    try {
      const filters: Record<string, unknown> = { [field]: value };
      const listOptions = options?.orderBy ? { orderBy: options.orderBy } : undefined;
      const entities = await this.db.findWhere<T>(this.tableName, filters, listOptions);
      return success(entities);
    } catch (error) {
      return failure(new DomainError(
        `Failed to find ${this.tableName} by ${String(field)}: ${value}`,
        'DATABASE_ERROR',
        error
      ));
    }
  }

  protected async findOne<K extends keyof T>(
    field: K,
    value: T[K]
  ): Promise<Result<T | null>> {
    try {
      const filters: Record<string, unknown> = { [field]: value };
      const entity = await this.db.findOne<T>(this.tableName, filters);
      return success(entity);
    } catch (error) {
      return failure(new DomainError(
        `Failed to find ${this.tableName} by ${String(field)}: ${value}`,
        'DATABASE_ERROR',
        error
      ));
    }
  }
}
