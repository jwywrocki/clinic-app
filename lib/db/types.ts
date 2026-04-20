export type Id = string;

/**
 * Like Partial<T>, but explicitly allows `undefined` and `null` values for each key.
 * Works correctly even when `exactOptionalPropertyTypes` or `noUncheckedIndexedAccess`
 * are enabled in tsconfig.
 */
export type LoosePartial<T> = { [K in keyof T]?: T[K] | null | undefined };

export interface ListOptions {
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface DBClient<Entity = any> {
  // Basic CRUD
  list<T extends Entity = Entity>(table: string, options?: ListOptions): Promise<T[]>;
  insert<T extends Entity = Entity>(table: string, data: LoosePartial<T>): Promise<T>;
  getById<T extends Entity = Entity>(table: string, id: Id): Promise<T | null>;
  updateById<T extends Entity = Entity>(table: string, id: Id, data: LoosePartial<T>): Promise<T>;
  deleteById(table: string, id: Id): Promise<void>;
  deleteWhere(table: string, filters: Record<string, unknown>): Promise<void>;

  // Filtering
  findWhere<T extends Entity = Entity>(
    table: string,
    filters: Record<string, unknown>,
    options?: ListOptions
  ): Promise<T[]>;
  findOne<T extends Entity = Entity>(
    table: string,
    filters: Record<string, unknown>
  ): Promise<T | null>;

  // Aggregation
  count(table: string, filters?: Record<string, unknown>): Promise<number>;

  // Batch operations
  insertMany<T extends Entity = Entity>(table: string, data: LoosePartial<T>[]): Promise<T[]>;
  upsert<T extends Entity = Entity>(
    table: string,
    data: LoosePartial<T>,
    conflictKeys?: string[]
  ): Promise<T>;

  // Raw query escape hatch (for complex joins, etc.)
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Executes multiple operations in a single database transaction.
   * If any operation throws, all changes are rolled back.
   *
   * @example
   * await db.transaction(async (tx) => {
   *   await tx.deleteById('contact_details', detailId);
   *   await tx.deleteById('contact_groups', groupId);
   * });
   */
  transaction<T>(fn: (tx: DBClient) => Promise<T>): Promise<T>;
}
