'use server';

import { getDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Specialization } from '@/lib/types/specializations';

export async function saveSpecializationAction(data: Partial<Specialization>) {
  const db = getDB();

  const payload = {
    name: data.name?.trim() || '',
    description: data.description?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (!payload.name) {
    return { success: false, error: 'Nazwa specjalizacji jest wymagana' };
  }

  const existing = await db.findOne<Specialization>('specializations', { name: payload.name });
  if (existing && existing.id !== data.id) {
    return { success: false, error: 'Specjalizacja o tej nazwie już istnieje' };
  }

  try {
    if (data.id) {
      await db.upsert('specializations', { ...payload, id: data.id });
    } else {
      await db.upsert('specializations', {
        ...payload,
        created_at: new Date().toISOString(),
      });
    }

    revalidatePath('/admin/specializations');
    revalidatePath('/admin/doctors');
    revalidatePath('/lekarze');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving specialization:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSpecializationAction(id: string) {
  const db = getDB();

  try {
    const linkedDoctors = await db.findWhere('doctors', { specialization: id });
    if (linkedDoctors.length > 0) {
      return {
        success: false,
        error: 'Nie można usunąć specjalizacji przypisanej do lekarza',
      };
    }

    await db.deleteById('specializations', id);

    revalidatePath('/admin/specializations');
    revalidatePath('/admin/doctors');
    revalidatePath('/lekarze');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting specialization:', error);
    return { success: false, error: error.message };
  }
}
