import { handleApiRequest, extractIdFromUrl, parseRequestBody } from '@/lib/api';
import { createDoctorService, CreateDoctorRequest, UpdateDoctorRequest } from '@/services';
import { requireAuth, isAuthError, getSessionFromRequest } from '@/lib/auth';
import { type NextRequest } from 'next/server';

const doctorService = createDoctorService();

export async function GET(request: Request) {
  return handleApiRequest(async () => {
    const id = extractIdFromUrl(request);

    if (id) {
      const result = await doctorService.getDoctorById(id);
      if (result.isFailure()) {
        throw result.error;
      }
      return result.data;
    }

    const session = await getSessionFromRequest(request);
    if (session) {
      const result = await doctorService.getAllDoctors();
      if (result.isFailure()) {
        throw result.error;
      }
      return result.data;
    }

    const result = await doctorService.getActiveDoctors();
    if (result.isFailure()) {
      throw result.error;
    }
    return result.data;
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  return handleApiRequest(async () => {
    const body = await parseRequestBody<CreateDoctorRequest>(request);

    const result = await doctorService.createDoctor(body);
    if (result.isFailure()) {
      throw result.error;
    }
    return result.data;
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  return handleApiRequest(async () => {
    const id = extractIdFromUrl(request);
    if (!id) {
      throw new Error('Doctor ID is required for update');
    }

    const body = await parseRequestBody<UpdateDoctorRequest>(request);

    const result = await doctorService.updateDoctor(id, body);
    if (result.isFailure()) {
      throw result.error;
    }
    return result.data;
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  return handleApiRequest(async () => {
    const id = extractIdFromUrl(request);
    if (!id) {
      throw new Error('Doctor ID is required for deletion');
    }

    const result = await doctorService.deleteDoctor(id);
    if (result.isFailure()) {
      throw result.error;
    }
    return { success: true };
  });
}
