import { getDB } from '@/lib/db';
import type { Service } from '@/lib/types/services';
import type { CreateServiceInput, UpdateServiceInput } from '@/lib/schemas';

export class ClinicServicesService {
  static async getAll(): Promise<Service[]> {
    const db = getDB();
    return db.list<Service>('services', { orderBy: { column: 'order_position', ascending: true } });
  }

  static async getPublished(): Promise<Service[]> {
    const db = getDB();
    return db.findWhere<Service>(
      'services',
      { is_published: true },
      { orderBy: { column: 'order_position', ascending: true } }
    );
  }

  static async getById(id: string): Promise<Service | null> {
    const db = getDB();
    return db.getById<Service>('services', id);
  }

  static async create(input: CreateServiceInput): Promise<Service> {
    const db = getDB();
    const now = new Date().toISOString();
    return db.insert<Service>('services', { ...input, created_at: now, updated_at: now });
  }

  static async update(id: string, input: UpdateServiceInput): Promise<Service> {
    const db = getDB();
    return db.updateById<Service>('services', id, { ...input, updated_at: new Date().toISOString() });
  }

  static async delete(id: string): Promise<void> {
    const db = getDB();
    return db.deleteById('services', id);
  }
}
