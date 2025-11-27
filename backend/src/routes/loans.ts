import { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { prisma } from '../server';

type LoanPayload = {
  name: string;
  type: string;
  amount: number;
  color?: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
};

const toDateOrUndefined = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export async function loansRoutes(app: FastifyInstance) {
  // Get all loans
  app.get('/loans', async () => {
    return prisma.loan.findMany({ orderBy: { createdAt: 'desc' } });
  });

  // Create a loan
  app.post('/loans', async (request, reply) => {
    const body = request.body as LoanPayload;

    const startDate = toDateOrUndefined(body.startDate);
    const endDate = toDateOrUndefined(body.endDate);

    const payload: Prisma.LoanCreateInput = {
      name: body.name,
      type: body.type as Prisma.LoanCreateInput['type'],
      amount: Number(body.amount),
      color: body.color ?? null,
      notes: body.notes ?? null,
    };

    if (startDate) {
      payload.startDate = startDate;
    }

    if (endDate) {
      payload.endDate = endDate;
    }

    const loan = await prisma.loan.create({
      data: payload,
    });

    return reply.code(201).send(loan);
  });

  // Delete loan
  app.delete('/loans/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.loan.delete({ where: { id } });
    return reply.code(204).send();
  });
}
