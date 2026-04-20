import { NextResponse } from 'next/server';
import { 
  DomainError, 
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  UnauthorizedError, 
  ForbiddenError 
} from '@/domain';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
  }, { status });
}

export function createErrorResponse(error: Error, status?: number): NextResponse<ApiResponse> {
  let statusCode = status || 500;
  let code = 'INTERNAL_ERROR';
  
  if (error instanceof ValidationError) {
    statusCode = 400;
    code = error.code;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    code = error.code;
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    code = error.code;
  } else if (error instanceof UnauthorizedError) {
    statusCode = 401;
    code = error.code;
  } else if (error instanceof ForbiddenError) {
    statusCode = 403;
    code = error.code;
  } else if (error instanceof DomainError) {
    statusCode = 400;
    code = error.code;
  }

  return NextResponse.json({
    success: false,
    error: {
      code,
      message: error.message,
      details: error instanceof DomainError ? error.details : undefined,
    },
  }, { status: statusCode });
}

export async function handleApiRequest<T>(
  handler: () => Promise<T>
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const result = await handler();
    return createSuccessResponse(result);
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body', 'body');
  }
}

export function extractIdFromUrl(request: Request): string | null {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const lastSegment = segments[segments.length - 1];
  
  // Check if it's likely an ID (not a known route name)
  if (lastSegment && !['doctors', 'pages', 'news', 'services'].includes(lastSegment)) {
    return lastSegment;
  }
  
  return null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function extractPaginationParams(request: Request): PaginationParams {
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const limit = url.searchParams.get('limit');
  
  const result: PaginationParams = {};
  
  if (page) {
    result.page = parseInt(page, 10);
  }
  
  if (limit) {
    result.limit = parseInt(limit, 10);
  }
  
  return result;
}

export function extractQueryParam(request: Request, param: string): string | null {
  const url = new URL(request.url);
  return url.searchParams.get(param);
}
