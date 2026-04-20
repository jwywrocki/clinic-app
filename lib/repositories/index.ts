export * from './interfaces';
export * from './base';
export * from './doctor';
export * from './page';

// Factory function to create repository instances
import { getDB } from '@/lib/db';
import { DoctorRepositoryImpl } from './doctor';
import { PageRepositoryImpl } from './page';

export function createDoctorRepository() {
  return new DoctorRepositoryImpl(getDB());
}

export function createPageRepository() {
  return new PageRepositoryImpl(getDB());
}

// Add more repository factories as needed
