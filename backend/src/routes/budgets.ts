import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createBudgetSchema, updateBudgetSchema, uuidParamSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth';

export default async function budgetRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { page = 1, limit = 20 } = request.query;
    
    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where: { userId: user.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.budget.count({ where: { userId: user.id } }),
    ]);
    
    return sendPaginated(reply, budgets, page, limit, total);
  });

  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    
    const budget = await prisma.budget.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!budget) return sendError(reply, 'Budget not found', 404, 'NOT_FOUND');
    return sendSuccess(reply, budget);
  });

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const data = createBudgetSchema.parse(request.body);
    
    const budget = await prisma.budget.create({
      data: {
        ...data,
        userId: user.id,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATED_BUDGET',
        entity: 'Budget',
        entityId: budget.id,
      },
    });
    
    return sendSuccess(reply, budget, 201);
  });

  fastify.put('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    const data = updateBudgetSchema.parse(request.body);
    
    const existing = await prisma.budget.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!existing) return sendError(reply, 'Budget not found', 404, 'NOT_FOUND');
    
    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'UPDATED_BUDGET',
        entity: 'Budget',
        entityId: budget.id,
      },
    });
    
    return sendSuccess(reply, budget);
  });

  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    
    const existing = await prisma.budget.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!existing) return sendError(reply, 'Budget not found', 404, 'NOT_FOUND');
    
    await prisma.budget.delete({ where: { id } });
    
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'DELETED_BUDGET',
        entity: 'Budget',
        entityId: id,
      },
    });
    
    return sendSuccess(reply, { message: 'Budget deleted successfully' });
  });
}
