import { FastifyInstance } from 'fastify';
import { prisma } from '../server';

interface ScheduledPayload {
  title: string;
  amount: number;
  category?: string;
  type: string;
  date: string | Date;
  repeatType?: string;
  repeatEvery?: number;
  color?: string;
  notes?: string;
  status?: string;
}

// Helper to convert string dates to Date objects or undefined
const toDateOrUndefined = (value: any): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
};

export async function scheduledRoutes(app: FastifyInstance) {
  // Get all scheduled items
  app.get('/scheduled', async () => {
    return prisma.scheduled.findMany({
      orderBy: { date: 'asc' },
    });
  });

  // Create new scheduled transaction
  app.post('/scheduled', async (req, reply) => {
    const body = req.body as ScheduledPayload;
    
    const scheduled = await prisma.scheduled.create({
      data: {
        title: body.title,
        amount: body.amount,
        category: body.category || null,
        type: body.type,
        date: toDateOrUndefined(body.date) || new Date(),
        repeatType: body.repeatType || null,
        repeatEvery: body.repeatEvery || null,
        color: body.color || null,
        notes: body.notes || null,
        status: body.status || 'upcoming',
      } as any,
    });
    
    return reply.code(201).send(scheduled);
  });

  // Update scheduled transaction
  app.put('/scheduled/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as Partial<ScheduledPayload>;
    
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.date !== undefined) updateData.date = toDateOrUndefined(body.date);
    if (body.repeatType !== undefined) updateData.repeatType = body.repeatType || null;
    if (body.repeatEvery !== undefined) updateData.repeatEvery = body.repeatEvery || null;
    if (body.color !== undefined) updateData.color = body.color || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.status !== undefined) updateData.status = body.status;
    
    const scheduled = await prisma.scheduled.update({
      where: { id },
      data: updateData,
    });
    
    return reply.send(scheduled);
  });

  // Delete scheduled transaction
  app.delete('/scheduled/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.scheduled.delete({ where: { id } });
    return reply.code(204).send();
  });
}
