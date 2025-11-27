import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createScheduledPaymentSchema, updateScheduledPaymentSchema, uuidParamSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth';

export default async function scheduledPaymentRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { page = 1, limit = 20 } = request.query;
    
    const [payments, total] = await Promise.all([
      prisma.scheduledPayment.findMany({
        where: { userId: user.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nextDate: 'asc' },
      }),
      prisma.scheduledPayment.count({ where: { userId: user.id } }),
    ]);
    
    return sendPaginated(reply, payments, page, limit, total);
  });

  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    
    const payment = await prisma.scheduledPayment.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!payment) return sendError(reply, 'Scheduled payment not found', 404, 'NOT_FOUND');
    return sendSuccess(reply, payment);
  });

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const data = createScheduledPaymentSchema.parse(request.body);
    
    const payment = await prisma.scheduledPayment.create({
      data: {
        ...data,
        userId: user.id,
        nextDate: new Date(data.nextDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATED_SCHEDULED_PAYMENT',
        entity: 'ScheduledPayment',
        entityId: payment.id,
      },
    });
    
    return sendSuccess(reply, payment, 201);
  });

  fastify.put('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    const data = updateScheduledPaymentSchema.parse(request.body);
    
    const existing = await prisma.scheduledPayment.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!existing) return sendError(reply, 'Scheduled payment not found', 404, 'NOT_FOUND');
    
    const payment = await prisma.scheduledPayment.update({
      where: { id },
      data: {
        ...data,
        nextDate: data.nextDate ? new Date(data.nextDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    
    return sendSuccess(reply, payment);
  });

  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as any;
    const { id } = uuidParamSchema.parse(request.params);
    
    const existing = await prisma.scheduledPayment.findFirst({
      where: { id, userId: user.id },
    });
    
    if (!existing) return sendError(reply, 'Scheduled payment not found', 404, 'NOT_FOUND');
    
    await prisma.scheduledPayment.delete({ where: { id } });
    
    return sendSuccess(reply, { message: 'Scheduled payment deleted successfully' });
  });
}
