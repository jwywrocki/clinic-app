export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public field: string,
    details?: any
  ) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

// Result pattern for better error handling
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly success = true;
  constructor(public data: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<any> {
    return false;
  }
}

export class Failure<E> {
  readonly success = false;
  constructor(public error: E) {}

  isSuccess(): this is Success<any> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }
}

export function success<T>(data: T): Success<T> {
  return new Success(data);
}

export function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}

// Validation utilities
export interface ValidationRule<T> {
  validate(value: T): string | null;
}

export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  validate(value: T): string[] {
    return this.rules
      .map(rule => rule.validate(value))
      .filter((error): error is string => error !== null);
  }

  isValid(value: T): boolean {
    return this.validate(value).length === 0;
  }
}

// Common validation rules
export const required = <T>(fieldName: string): ValidationRule<T> => ({
  validate: (value: T) => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  },
});

export const minLength = (min: number, fieldName: string): ValidationRule<string> => ({
  validate: (value: string) => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },
});

export const maxLength = (max: number, fieldName: string): ValidationRule<string> => ({
  validate: (value: string) => {
    if (value && value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`;
    }
    return null;
  },
});

export const email = (fieldName: string): ValidationRule<string> => ({
  validate: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },
});
