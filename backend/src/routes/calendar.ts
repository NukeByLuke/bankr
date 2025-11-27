import { FastifyInstance } from 'fastify';
import { prisma } from '../server';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'transaction' | 'subscription' | 'scheduled';
  category?: string;
  color?: string;
  eventType?: string; // income/expense for scheduled
}

export async function calendarRoutes(app: FastifyInstance) {
  // Get all calendar events for a date range
  app.get('/calendar', async (req) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    const events: CalendarEvent[] = [];

    // Fetch subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { active: true },
    });

    subscriptions.forEach((sub) => {
      events.push({
        id: sub.id,
        title: sub.title,
        date: sub.nextPayment.toISOString(),
        amount: sub.amount,
        type: 'subscription',
        category: sub.category || undefined,
        color: sub.color || '#8b5cf6',
      });
    });

    // Fetch scheduled transactions
    const scheduled = await prisma.scheduled.findMany({
      where: startDate && endDate ? {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      } : {},
    });

    scheduled.forEach((item) => {
      events.push({
        id: item.id,
        title: item.title,
        date: item.date.toISOString(),
        amount: item.amount,
        type: 'scheduled',
        category: item.category || undefined,
        color: item.color || '#facc15',
        eventType: item.type,
      });
    });

    // Fetch loans (show start and end dates)
    const loans = await prisma.loan.findMany();

    loans.forEach((loan) => {
      // Add start date event
      events.push({
        id: `${loan.id}-start`,
        title: `${loan.name} (Start)`,
        date: loan.startDate.toISOString(),
        amount: loan.amount,
        type: 'transaction',
        color: loan.color || '#3b82f6',
      });

      // Add end date event if exists
      if (loan.endDate) {
        events.push({
          id: `${loan.id}-end`,
          title: `${loan.name} (Due)`,
          date: loan.endDate.toISOString(),
          amount: loan.amount,
          type: 'transaction',
          color: loan.color || '#3b82f6',
        });
      }
    });

    return events;
  });
}
