import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

/**
 * Global error handler
 * Catches all errors and returns standardized error responses
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error for debugging
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return sendError(
      reply,
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  // JWT errors
  if (error.statusCode === 401) {
    return sendError(reply, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return sendError(
        reply,
        'A record with this data already exists',
        409,
        'DUPLICATE_ENTRY'
      );
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return sendError(reply, 'Record not found', 404, 'NOT_FOUND');
    }
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  return sendError(
    reply,
    message,
    statusCode,
    error.code || 'INTERNAL_ERROR'
  );
}
