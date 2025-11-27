import { FastifyInstance } from 'fastify';
import { prisma } from '../server';

export async function activityRoutes(app: FastifyInstance) {
  // Get recent activity logs (simplified for demo - no auth required)
  app.get('/activity', async (req) => {
    const query = req.query as { limit?: string };
    const limit = query.limit ? parseInt(query.limit, 10) : 100;
    
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        details: true,
        createdAt: true,
      },
    });
    
    return logs;
  });
}
