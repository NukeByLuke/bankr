import { FastifyReply } from 'fastify';

/**
 * Standard API response utilities
 * Ensures consistent response format across all endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): FastifyReply {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return reply.code(statusCode).send(response);
}

/**
 * Send error response
 */
export function sendError(
  reply: FastifyReply,
  message: string,
  statusCode: number = 400,
  code?: string,
  details?: any
): FastifyReply {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };

  return reply.code(statusCode).send(response);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  page: number,
  limit: number,
  total: number
): FastifyReply {
  return sendSuccess(reply, data, 200, {
    page,
    limit,
    total,
  });
}
