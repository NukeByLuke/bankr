import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/response';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    await request.jwtVerify();
  } catch (error) {
    return sendError(reply, 'Invalid or expired token', 401, 'UNAUTHORIZED');
  }
}

/**
 * Role-based access control middleware
 * Ensures user has required role
 */
export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;

    if (!user || !allowedRoles.includes(user.role)) {
      return sendError(
        reply,
        'You do not have permission to access this resource',
        403,
        'FORBIDDEN'
      );
    }
  };
}

/**
 * Premium user check middleware
 */
export async function requirePremium(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as any;

  if (!user || (user.role !== 'PREMIUM' && user.role !== 'ADMIN')) {
    return sendError(
      reply,
      'This feature requires a Premium subscription',
      403,
      'PREMIUM_REQUIRED'
    );
  }
}
