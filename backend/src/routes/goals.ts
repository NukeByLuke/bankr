import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createGoalSchema, updateGoalSchema, uuidParamSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth';

export default async function goalRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { page = 1, limit = 20 } = request.query;
    
    // Ensure page and limit are numbers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    
    const [goals, total] = await Promise.all([
      prisma.goal.findMany({
        where: { userId: user.id },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.goal.count({ where: { userId: user.id } }),
    ]);
    
    return sendPaginated(reply, goals, pageNum, limitNum, total);
  });

  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    
    const goal = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!goal) return sendError(reply, 'Goal not found', 404, 'NOT_FOUND');
    return sendSuccess(reply, goal);
  });

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const data = createGoalSchema.parse(request.body);
    
    console.log('📊 Creating goal:', {
      userId: user.id,
      name: data.name,
      type: data.type,
      targetAmount: data.targetAmount,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        name: data.name,
        type: data.type || 'SAVINGS',
        color: data.color,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        description: data.description,
      },
    });
    
    console.log('✅ Goal created:', goal);
    
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATED_GOAL',
        entity: 'Goal',
        entityId: goal.id,
      },
    });
    
    return sendSuccess(reply, goal, 201);
  });

  fastify.put('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    const data = updateGoalSchema.parse(request.body);
    
    const existing = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!existing) return sendError(reply, 'Goal not found', 404, 'NOT_FOUND');
    
    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });
    
    return sendSuccess(reply, goal);
  });

  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    
    const existing = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!existing) return sendError(reply, 'Goal not found', 404, 'NOT_FOUND');
    
    await prisma.goal.delete({ where: { id } });
    
    return sendSuccess(reply, { message: 'Goal deleted successfully' });
  });
}
