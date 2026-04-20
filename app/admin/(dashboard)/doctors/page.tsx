import { getDB } from '@/lib/db';
import { DoctorsManagement } from '../../components/DoctorsManagement';
import { saveDoctorAction, deleteDoctorAction } from '../../actions/doctors';
import { Doctor } from '@/lib/types/doctors';
import { Specialization } from '@/lib/types/specializations';

interface DoctorSpecializationLink {
  id: string;
  doctor_id: string;
  specialization_id: string;
}

export default async function AdminDoctorsPage() {
  const db = getDB();

  let specializations: Specialization[] = [];
  let specializationsEnabled = true;
  try {
    specializations = await db.list<Specialization>('specializations', {
      orderBy: { column: 'name', ascending: true },
    });
  } catch {
    specializations = [];
    specializationsEnabled = false;
  }

  const doctors = await db.findWhere<Doctor>(
    'doctors',
    {},
    { orderBy: { column: 'last_name', ascending: true } }
  );

  let doctorLinks: DoctorSpecializationLink[] = [];
  try {
    doctorLinks = await db.list<DoctorSpecializationLink>('doctor_has_specializations');
  } catch {
    doctorLinks = [];
  }

  // One-time compatibility: if a doctor still has a legacy text specialization,
  // create a matching specialization row and replace doctor.specialization with its ID.
  if (specializationsEnabled) {
    for (const doctor of doctors) {
      const linked = specializations.find(s => s.id === doctor.specialization);
      if (linked || !doctor.specialization) continue;

      const legacyName = doctor.specialization.trim();
      if (!legacyName) continue;

      let spec = specializations.find(s => s.name.toLowerCase() === legacyName.toLowerCase());
      if (!spec) {
        spec = await db.insert<Specialization>('specializations', {
          name: legacyName,
          description: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        specializations = [...specializations, spec];
      }

      await db.updateById<Doctor>('doctors', doctor.id, {
        specialization: spec.id,
        updated_at: new Date().toISOString(),
      });
      doctor.specialization = spec.id;

      try {
        const exists = doctorLinks.find(
          link => link.doctor_id === doctor.id && link.specialization_id === spec!.id
        );
        if (!exists) {
          const created = await db.insert<DoctorSpecializationLink>('doctor_has_specializations', {
            doctor_id: doctor.id,
            specialization_id: spec.id,
          });
          doctorLinks = [...doctorLinks, created];
        }
      } catch {
        // Compatibility fallback before migration.
      }
    }
  }

  const doctorsWithNames = doctors.map(doctor => {
    const specializationIds = doctorLinks
      .filter(link => link.doctor_id === doctor.id)
      .map(link => link.specialization_id);

    const effectiveIds =
      specializationIds.length > 0 ? specializationIds : [doctor.specialization].filter(Boolean);

    const names = effectiveIds
      .map(id => specializations.find(s => s.id === id)?.name || id)
      .filter(Boolean);

    return {
      ...doctor,
      specialization_ids: effectiveIds,
      specialization_name: names[0] || doctor.specialization,
      specialization_names: names,
    };
  });

  return (
    <DoctorsManagement
      doctors={doctorsWithNames}
      specializations={specializations}
      onSave={saveDoctorAction}
      onDelete={deleteDoctorAction}
    />
  );
}
