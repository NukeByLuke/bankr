import { z } from 'zod';

/**
 * Validation schemas using Zod
 * Centralized validation for request bodies and params
 */

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const categoryValues = [
  'FOOD',
  'TRANSPORT',
  'TRANSPORTATION',
  'SHOPPING',
  'ENTERTAINMENT',
  'BILLS',
  'UTILITIES',
  'HEALTHCARE',
  'EDUCATION',
  'HOUSING',
  'TRAVEL',
  'GIFTS',
  'TECHNOLOGY',
  'LIFESTYLE',
  'CLOTHING',
  'SALARY',
  'BUSINESS',
  'INVESTMENT',
  'INVESTMENTS',
  'FREELANCE',
  'CASH',
  'SAVINGS',
  'OTHER',
] as const;

const CategoryEnum = z.enum(categoryValues);

// Transaction schemas
export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  category: CategoryEnum,
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  merchant: z.string().optional(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

// Budget schemas
export const createBudgetSchema = z.object({
  category: CategoryEnum,
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  alertAt: z.number().min(0).max(100).optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Goal schemas
export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['SAVINGS', 'EXPENSE']).optional(),
  color: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  deadline: z.string().datetime().optional(),
  description: z.string().optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

// Loan schemas
const loanSchemaBase = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['lent', 'borrowed']),
  amount: z.number().positive('Amount must be positive'),
  color: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createLoanSchema = loanSchemaBase.superRefine((data, ctx) => {
  if (data.endDate && data.startDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after the start date',
        path: ['endDate'],
      });
    }
  }
});

export const updateLoanSchema = loanSchemaBase.partial();

// Subscription schemas
export const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().datetime(),
  nextBilling: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  category: CategoryEnum.optional(),
  description: z.string().optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();

// Scheduled Payment schemas
export const createScheduledPaymentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  nextDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  category: CategoryEnum.optional(),
  autoExecute: z.boolean().optional(),
  description: z.string().optional(),
});

export const updateScheduledPaymentSchema = createScheduledPaymentSchema.partial();

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

// UUID param schema
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});
