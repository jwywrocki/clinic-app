'use server';

import { getDB } from '@/lib/db';
import { Doctor } from '@/lib/types/doctors';
import { Specialization } from '@/lib/types/specializations';
import { revalidatePath } from 'next/cache';

interface DoctorSpecializationLink {
  id: string;
  doctor_id: string;
  specialization_id: string;
}

async function resolveSpecializationId(value: string): Promise<string> {
  const db = getDB();

  if (!value?.trim()) return '';

  try {
    const asId = await db.getById<Specialization>('specializations', value);
    if (asId) return asId.id;

    const normalized = value.trim();
    const byName = await db.findOne<Specialization>('specializations', { name: normalized });
    if (byName) return byName.id;

    const created = await db.insert<Specialization>('specializations', {
      name: normalized,
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return created.id;
  } catch {
    // Compatibility fallback before running SQL migration: keep legacy text value.
    return value.trim();
  }
}

export async function saveDoctorAction(data: Partial<Doctor>) {
  const db = getDB();

  const providedIds = (data.specialization_ids || []).filter(Boolean);
  const resolvedIds: string[] = [];

  for (const value of providedIds) {
    const id = await resolveSpecializationId(value);
    if (id && !resolvedIds.includes(id)) resolvedIds.push(id);
  }

  if (resolvedIds.length === 0 && data.specialization) {
    const fallback = await resolveSpecializationId(data.specialization);
    if (fallback) resolvedIds.push(fallback);
  }

  const primarySpecializationId = resolvedIds[0] || '';

  const payload = {
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    specialization: primarySpecializationId,
    bio: data.bio || '',
    image_url: data.image_url || '',
    schedule: data.schedule || '',
    is_active: data.is_active ?? true,
    order_position: data.order_position || 1,
    updated_at: new Date().toISOString(),
  };

  try {
    if (!payload.specialization) {
      return { success: false, error: 'Specjalizacja jest wymagana' };
    }

    const doctorId = data.id || crypto.randomUUID();

    if (data.id) {
      await db.upsert('doctors', { ...payload, id: doctorId });
    } else {
      await db.upsert('doctors', {
        ...payload,
        id: doctorId,
        created_at: new Date().toISOString(),
      });
    }

    try {
      const existing = await db.findWhere<DoctorSpecializationLink>('doctor_has_specializations', {
        doctor_id: doctorId,
      });
      for (const link of existing) {
        await db.deleteById('doctor_has_specializations', link.id);
      }

      if (resolvedIds.length > 0) {
        await db.insertMany(
          'doctor_has_specializations',
          resolvedIds.map(specialization_id => ({
            doctor_id: doctorId,
            specialization_id,
          }))
        );
      }
    } catch {
      // Compatibility fallback before migration.
    }

    revalidatePath('/admin/doctors');
    revalidatePath('/admin/specializations');
    revalidatePath('/lekarze');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving doctor:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteDoctorAction(id: string): Promise<void> {
  const db = getDB();
  try {
    await db.deleteWhere('doctor_has_specializations', { doctor_id: id });
    await db.deleteById('doctors', id);
    revalidatePath('/admin/doctors');
    revalidatePath('/lekarze');
  } catch (error: any) {
    console.error('Error deleting doctor:', error);
    throw new Error(error.message);
  }
}
