import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import {
  createTransactionSchema,
  updateTransactionSchema,
  paginationSchema,
  uuidParamSchema,
} from '../utils/validation';
import { authenticate } from '../middleware/auth';

/**
 * Transaction Routes
 * CRUD operations for user transactions
 */

export default async function transactionRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  /**
   * GET /api/transactions
   * List all transactions for current user with pagination
   */
  fastify.get(
    '/',
    async (
      request: FastifyRequest<{
        Querystring: { page?: number; limit?: number; type?: string; category?: string; month?: string; year?: number };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const user = request.user as any;
        const { page = 1, limit = 20, type, category, month, year } = request.query;

        // Ensure page and limit are numbers
        const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
        const yearNum = year && typeof year === 'string' ? parseInt(year, 10) : year;

        const where: any = { userId: user.id };
        if (type) where.type = type;
        if (category) where.category = category;

        // Filter by month and year if provided
        if (month && yearNum) {
          const monthIndex = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ].indexOf(month);

          if (monthIndex !== -1) {
            const startDate = new Date(yearNum, monthIndex, 1);
            const endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
            
            where.date = {
              gte: startDate,
              lte: endDate,
            };
          }
        }

        const [transactions, total] = await Promise.all([
          prisma.transaction.findMany({
            where,
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { date: 'desc' },
          }),
          prisma.transaction.count({ where }),
        ]);

        return sendPaginated(reply, transactions, pageNum, limitNum, total);
      } catch (error) {
        throw error;
      }
    }
  );

  /**
   * GET /api/transactions/:id
   * Get single transaction
   */
  fastify.get(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const { id } = uuidParamSchema.parse(request.params);

        const transaction = await prisma.transaction.findFirst({
          where: {
            id,
            userId: user.id,
          },
        });

        if (!transaction) {
          return sendError(reply, 'Transaction not found', 404, 'NOT_FOUND');
        }

        return sendSuccess(reply, transaction);
      } catch (error) {
        throw error;
      }
    }
  );

  /**
   * POST /api/transactions
   * Create new transaction
   */
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const data = createTransactionSchema.parse(request.body);

      const transaction = await prisma.transaction.create({
        data: {
          ...data,
          userId: user.id,
          date: data.date ? new Date(data.date) : new Date(),
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATED_TRANSACTION',
          entity: 'Transaction',
          entityId: transaction.id,
          details: `Created ${transaction.type} transaction of ${transaction.amount}`,
        },
      });

      return sendSuccess(reply, transaction, 201);
    } catch (error) {
      throw error;
    }
  });

  /**
   * PUT /api/transactions/:id
   * Update transaction
   */
  fastify.put(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const { id } = uuidParamSchema.parse(request.params);
        const data = updateTransactionSchema.parse(request.body);

        // Check if transaction exists and belongs to user
        const existing = await prisma.transaction.findFirst({
          where: { id, userId: user.id },
        });

        if (!existing) {
          return sendError(reply, 'Transaction not found', 404, 'NOT_FOUND');
        }

        const transaction = await prisma.transaction.update({
          where: { id },
          data: {
            ...data,
            date: data.date ? new Date(data.date) : existing.date,
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: 'UPDATED_TRANSACTION',
            entity: 'Transaction',
            entityId: transaction.id,
          },
        });

        return sendSuccess(reply, transaction);
      } catch (error) {
        throw error;
      }
    }
  );

  /**
   * DELETE /api/transactions/:id
   * Delete transaction
   */
  fastify.delete(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const { id } = uuidParamSchema.parse(request.params);

        // Check if transaction exists and belongs to user
        const existing = await prisma.transaction.findFirst({
          where: { id, userId: user.id },
        });

        if (!existing) {
          return sendError(reply, 'Transaction not found', 404, 'NOT_FOUND');
        }

        await prisma.transaction.delete({ where: { id } });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: 'DELETED_TRANSACTION',
            entity: 'Transaction',
            entityId: id,
          },
        });

        return sendSuccess(reply, { message: 'Transaction deleted successfully' });
      } catch (error) {
        throw error;
      }
    }
  );

  /**
   * GET /api/transactions/stats/summary
   * Get transaction statistics
   */
  fastify.get('/stats/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as any;

      const [income, expenses, transactionCount] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId: user.id, type: 'INCOME' },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId: user.id, type: 'EXPENSE' },
          _sum: { amount: true },
        }),
        prisma.transaction.count({ where: { userId: user.id } }),
      ]);

      const totalIncome = income._sum.amount || 0;
      const totalExpenses = expenses._sum.amount || 0;
      const balance = totalIncome - totalExpenses;

      return sendSuccess(reply, {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount,
      });
    } catch (error) {
      throw error;
    }
  });
}
