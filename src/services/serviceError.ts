// src/services/serviceError.ts
// Shared service-layer error normalization to keep thrown errors consistent.

export type ServiceErrorCode =
  | 'validation'
  | 'network'
  | 'auth'
  | 'forbidden'
  | 'not_found'
  | 'db'
  | 'unknown';

export class ServiceError extends Error {
  code: ServiceErrorCode;
  cause?: unknown;

  constructor(code: ServiceErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.cause = cause;
  }
}

export function toServiceError(error: unknown, fallbackMessage: string): ServiceError {
  if (error instanceof ServiceError) return error;

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('failed to fetch') || message.includes('network')) {
      return new ServiceError('network', fallbackMessage, error);
    }

    if (
      message.includes('unauthorized') ||
      message.includes('jwt') ||
      message.includes('invalid login')
    ) {
      return new ServiceError('auth', fallbackMessage, error);
    }

    if (message.includes('forbidden') || message.includes('permission')) {
      return new ServiceError('forbidden', fallbackMessage, error);
    }

    if (message.includes('no rows') || message.includes('not found')) {
      return new ServiceError('not_found', fallbackMessage, error);
    }

    return new ServiceError('db', fallbackMessage, error);
  }

  return new ServiceError('unknown', fallbackMessage, error);
}

export function assertRequiredString(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new ServiceError('validation', `${fieldName} is required.`);
  }
}
