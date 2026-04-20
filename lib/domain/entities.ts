export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface OrderByOptions {
  column: string;
  ascending: boolean;
}

export interface QueryOptions {
  orderBy?: OrderByOptions;
  pagination?: PaginationOptions;
  filters?: Record<string, any>;
}
