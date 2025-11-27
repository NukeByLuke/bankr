import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';
import goalRoutes from './routes/goals';
import { loansRoutes } from './routes/loans';
import { subscriptionsRoutes } from './routes/subscriptions';
import { scheduledRoutes } from './routes/scheduled';
import { calendarRoutes } from './routes/calendar';
import { activityRoutes } from './routes/activity';
import scheduledPaymentRoutes from './routes/scheduledPayments';
import activityLogRoutes from './routes/activityLogs';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Bankr Backend Server
 * Secure, fast, and modular finance tracking API
 */
async function buildServer() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV === 'development' ? true : { level: 'error' },
  });

  // Register security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });

  // Register CORS
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Register JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_ACCESS_SECRET || 'your-secret-key-change-this',
    sign: {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    },
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(transactionRoutes, { prefix: '/api/transactions' });
  await fastify.register(budgetRoutes, { prefix: '/api/budgets' });
  await fastify.register(goalRoutes, { prefix: '/api/goals' });
  await fastify.register(loansRoutes, { prefix: '/api' });
  await fastify.register(subscriptionsRoutes, { prefix: '/api' });
  await fastify.register(scheduledRoutes, { prefix: '/api' });
  await fastify.register(calendarRoutes, { prefix: '/api' });
  await fastify.register(activityRoutes, { prefix: '/api' });
  await fastify.register(scheduledPaymentRoutes, { prefix: '/api/scheduled-payments' });
  await fastify.register(activityLogRoutes, { prefix: '/api/activity-logs' });
  await fastify.register(userRoutes, { prefix: '/api/users' });

  // Register global error handler
  fastify.setErrorHandler(errorHandler);

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      success: false,
      error: {
        message: 'Route not found',
        code: 'NOT_FOUND',
      },
    });
  });

  return fastify;
}

/**
 * Start the server
 */
async function start() {
  try {
    const fastify = await buildServer();
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    console.log(`
╔════════════════════════════════════════╗
║        🏦 Bankr API Server            ║
║                                        ║
║  Status: ✅ Running                    ║
║  Port:   ${port}                          ║
║  Host:   ${host}                  ║
║  Env:    ${process.env.NODE_ENV || 'development'}              ║
║                                        ║
║  Health: http://localhost:${port}/health  ║
╚════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
start();
