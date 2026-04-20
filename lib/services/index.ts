export * from './doctor';
export * from './news';
export * from './pages';
export * from './clinic-services';
export * from './menus';
export * from './contact';
export * from './surveys';
export * from './settings';
export * from './users';

import { createDoctorRepository } from '@/repositories';
import { DoctorService } from './doctor';

export function createDoctorService() {
  return new DoctorService(createDoctorRepository());
}
