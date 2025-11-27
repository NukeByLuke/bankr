import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, requireRole } from '../middleware/auth';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Admin only: List all users
  fastify.get('/', { preHandler: requireRole('ADMIN') }, async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    
    return sendSuccess(reply, users);
  });

  // Update current user profile
  fastify.put('/me', async (request: FastifyRequest<{ Body: { firstName?: string; lastName?: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { firstName, lastName } = request.body;
    
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return sendSuccess(reply, updated);
  });

  // Delete current user account
  fastify.delete('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    
    await prisma.user.delete({
      where: { id: user.id },
    });
    
    return sendSuccess(reply, { message: 'Account deleted successfully' });
  });
}
