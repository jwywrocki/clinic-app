import { Doctor, Result, success, failure, ValidationError, NotFoundError } from '@/domain';
import { DoctorRepository } from '@/repositories';

export interface CreateDoctorRequest {
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

export interface UpdateDoctorRequest {
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

export class DoctorService {
  constructor(private doctorRepository: DoctorRepository) {}

  async getAllDoctors(): Promise<Result<Doctor[]>> {
    return this.doctorRepository.findAll({
      orderBy: { column: 'order_position', ascending: true },
    });
  }

  async getActiveDoctors(): Promise<Result<Doctor[]>> {
    return this.doctorRepository.findActive();
  }

  async getDoctorById(id: string): Promise<Result<Doctor>> {
    const result = await this.doctorRepository.findById(id);
    if (result.isFailure()) {
      return result;
    }

    if (!result.data) {
      return failure(new NotFoundError('Doctor', id));
    }

    return success(result.data);
  }

  async getDoctorsBySpecialization(specialization: string): Promise<Result<Doctor[]>> {
    return this.doctorRepository.findBySpecialization(specialization);
  }

  async getDoctorsByCategory(category: string): Promise<Result<Doctor[]>> {
    return this.doctorRepository.findByCategory(category);
  }

  async createDoctor(request: CreateDoctorRequest): Promise<Result<Doctor>> {
    // Validate input
    const validationResult = this.validateCreateDoctorRequest(request);
    if (validationResult.isFailure()) {
      return validationResult;
    }

    const doctorData = {
      first_name: request.first_name,
      last_name: request.last_name,
      specialization: request.specialization,
      bio: request.bio || '',
      image_url: request.image_url || '',
      schedule: request.schedule || '',
      is_active: request.is_active ?? true,
      order_position: request.order_position ?? 1,
    };

    return this.doctorRepository.create(doctorData);
  }

  async updateDoctor(id: string, request: UpdateDoctorRequest): Promise<Result<Doctor>> {
    // Check if doctor exists
    const existsResult = await this.doctorRepository.exists(id);
    if (existsResult.isFailure()) {
      return failure(existsResult.error);
    }

    if (!existsResult.data) {
      return failure(new NotFoundError('Doctor', id));
    }

    // Validate input
    const validationResult = this.validateUpdateDoctorRequest(request);
    if (validationResult.isFailure()) {
      return validationResult;
    }

    return this.doctorRepository.update(id, request);
  }

  async deleteDoctor(id: string): Promise<Result<void>> {
    // Check if doctor exists
    const existsResult = await this.doctorRepository.exists(id);
    if (existsResult.isFailure()) {
      return failure(existsResult.error);
    }

    if (!existsResult.data) {
      return failure(new NotFoundError('Doctor', id));
    }

    return this.doctorRepository.delete(id);
  }

  async updateDoctorOrderPositions(
    updates: Array<{ id: string; order_position: number }>
  ): Promise<Result<void>> {
    // Validate all doctors exist
    for (const update of updates) {
      const existsResult = await this.doctorRepository.exists(update.id);
      if (existsResult.isFailure()) {
        return failure(existsResult.error);
      }

      if (!existsResult.data) {
        return failure(new NotFoundError('Doctor', update.id));
      }
    }

    return this.doctorRepository.updateOrderPositions(updates);
  }

  private validateCreateDoctorRequest(request: CreateDoctorRequest): Result<void> {
    const errors: string[] = [];

    if (!request.first_name) {
      errors.push('first_name is required');
    } else if (request.first_name.length < 2) {
      errors.push('first_name must be at least 2 characters long');
    } else if (request.first_name.length > 100) {
      errors.push('first_name must be no more than 100 characters long');
    }

    if (!request.last_name) {
      errors.push('last_name is required');
    } else if (request.last_name.length < 2) {
      errors.push('last_name must be at least 2 characters long');
    } else if (request.last_name.length > 100) {
      errors.push('last_name must be no more than 100 characters long');
    }

    if (!request.specialization) {
      errors.push('specialization is required');
    } else if (request.specialization.length < 2) {
      errors.push('specialization must be at least 2 characters long');
    } else if (request.specialization.length > 200) {
      errors.push('specialization must be no more than 200 characters long');
    }

    if (errors.length > 0) {
      return failure(new ValidationError(errors.join(', '), 'validation'));
    }

    return success(undefined);
  }

  private validateUpdateDoctorRequest(request: UpdateDoctorRequest): Result<void> {
    const errors: string[] = [];

    if (request.first_name !== undefined) {
      if (request.first_name.length < 2) {
        errors.push('first_name must be at least 2 characters long');
      } else if (request.first_name.length > 100) {
        errors.push('first_name must be no more than 100 characters long');
      }
    }

    if (request.last_name !== undefined) {
      if (request.last_name.length < 2) {
        errors.push('last_name must be at least 2 characters long');
      } else if (request.last_name.length > 100) {
        errors.push('last_name must be no more than 100 characters long');
      }
    }

    if (request.specialization !== undefined) {
      if (request.specialization.length < 2) {
        errors.push('specialization must be at least 2 characters long');
      } else if (request.specialization.length > 200) {
        errors.push('specialization must be no more than 200 characters long');
      }
    }

    if (errors.length > 0) {
      return failure(new ValidationError(errors.join(', '), 'validation'));
    }

    return success(undefined);
  }
}
