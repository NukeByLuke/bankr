import { FastifyInstance } from 'fastify';
import { prisma } from '../server';

type SubscriptionPayload = {
  title: string;
  category?: string;
  amount: number;
  periodLength: number;
  periodType: string;
  nextPayment?: string;
  color?: string;
  notes?: string;
};

const toDateOrUndefined = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export async function subscriptionsRoutes(app: FastifyInstance) {
  // Get all subscriptions
  app.get('/subscriptions', async () => {
    return prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
  });

  // Create a subscription
  app.post('/subscriptions', async (request, reply) => {
    const body = request.body as SubscriptionPayload;

    const nextPayment = toDateOrUndefined(body.nextPayment);

    const payload = {
      title: body.title,
      category: body.category,
      amount: Number(body.amount),
      periodLength: Number(body.periodLength),
      periodType: body.periodType,
      color: body.color,
      notes: body.notes,
      ...(nextPayment ? { nextPayment } : {}),
    };

    const subscription = await prisma.subscription.create({
      data: payload as any,
    });

    return reply.code(201).send(subscription);
  });

  // Delete subscription
  app.delete('/subscriptions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.subscription.delete({ where: { id } });
    return reply.code(204).send();
  });
}
