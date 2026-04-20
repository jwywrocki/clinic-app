import { getDB } from '@/lib/db';
import { SpecializationsManagement } from '../../components/SpecializationsManagement';
import {
  saveSpecializationAction,
  deleteSpecializationAction,
} from '../../actions/specializations';
import { Specialization } from '@/lib/types/specializations';

export default async function AdminSpecializationsPage() {
  const db = getDB();

  let specializations: Specialization[] = [];
  try {
    specializations = await db.list<Specialization>('specializations', {
      orderBy: { column: 'name', ascending: true },
    });
  } catch {
    specializations = [];
  }

  return (
    <SpecializationsManagement
      specializations={specializations}
      onSave={saveSpecializationAction}
      onDelete={deleteSpecializationAction}
    />
  );
}
