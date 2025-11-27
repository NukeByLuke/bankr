import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { sendSuccess, sendPaginated } from '../utils/response';
import { authenticate } from '../middleware/auth';

export default async function activityLogRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { page = 1, limit = 50 } = request.query;
    
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { userId: user.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where: { userId: user.id } }),
    ]);
    
    return sendPaginated(reply, logs, page, limit, total);
  });
}
