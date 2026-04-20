'use client';

import { useState, useEffect, useCallback } from 'react';
import { Doctor } from '@/domain';

export interface UseDoctorsOptions {
  activeOnly?: boolean;
}

export interface UseDoctorsResult {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDoctor: (doctor: CreateDoctorData) => Promise<Doctor>;
  updateDoctor: (id: string, doctor: UpdateDoctorData) => Promise<Doctor>;
  deleteDoctor: (id: string) => Promise<void>;
}

export interface CreateDoctorData {
  first_name: string;
  last_name: string;
  specialization: string;
  specialization_ids?: string[];
  bio?: string;
  image_url?: string;
  schedule?: string;
  is_active?: boolean;
  order_position?: number;
}

export interface UpdateDoctorData {
  first_name?: string;
  last_name?: string;
  specialization?: string;
  specialization_ids?: string[];
  bio?: string;
  image_url?: string;
  schedule?: string;
  is_active?: boolean;
  order_position?: number;
}

export function useDoctors(options: UseDoctorsOptions = {}): UseDoctorsResult {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/doctors';
      const params = new URLSearchParams();

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch doctors');
      }

      let filteredDoctors = result.data;

      // Filter only active doctors if specified
      if (options.activeOnly) {
        filteredDoctors = filteredDoctors.filter((doctor: Doctor) => doctor.is_active);
      }

      setDoctors(filteredDoctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [options.activeOnly]);

  const createDoctor = useCallback(
    async (doctorData: CreateDoctorData): Promise<Doctor> => {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create doctor');
      }

      await fetchDoctors(); // Refresh the list
      return result.data;
    },
    [fetchDoctors]
  );

  const updateDoctor = useCallback(
    async (id: string, doctorData: UpdateDoctorData): Promise<Doctor> => {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update doctor');
      }

      await fetchDoctors(); // Refresh the list
      return result.data;
    },
    [fetchDoctors]
  );

  const deleteDoctor = useCallback(
    async (id: string): Promise<void> => {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete doctor');
      }

      await fetchDoctors(); // Refresh the list
    },
    [fetchDoctors]
  );

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  };
}
