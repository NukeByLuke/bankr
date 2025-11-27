import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '@/utils/api';
import { z } from 'zod';

const subscriptionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  category: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  periodLength: z.number().int('Period length must be an integer').positive('Period length must be at least 1'),
  periodType: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  nextPayment: z.string().min(1, 'Next payment date is required'),
  notes: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  '#5af0c8',
  '#3be8a0',
  '#f472b6',
  '#fb923c',
  '#fbbf24',
  '#a78bfa',
  '#60a5fa',
  '#34d399',
];

const CATEGORIES = [
  'Entertainment',
  'Software',
  'Utilities',
  'Healthcare',
  'Insurance',
  'Memberships',
  'Education',
  'Other',
];

const PERIOD_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

const normalizeToMidday = (dateString: string): string => {
  if (!dateString) return dateString;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};

export default function AddSubscriptionModal({ isOpen, onClose }: AddSubscriptionModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SubscriptionFormData>({
    defaultValues: {
      title: '',
      category: '',
      amount: 0,
      periodLength: 1,
      periodType: 'monthly',
      nextPayment: '',
      notes: '',
      color: COLOR_SWATCHES[0],
    },
  });

  const selectedColor = watch('color');

  const createSubscription = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      const payload = {
        ...data,
        nextPayment: normalizeToMidday(data.nextPayment),
        category: data.category || null,
        notes: data.notes || null,
      };
      await apiClient.post('/subscriptions', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    // Basic validation
    if (!data.title || !data.nextPayment || data.amount <= 0 || data.periodLength < 1) {
      return;
    }
    createSubscription.mutate(data);
  };

  const handleClose = () => {
    if (!createSubscription.isPending) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-glass max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold">Add Subscription</h2>
          <button
            onClick={handleClose}
            disabled={createSubscription.isPending}
            className="rounded-lg p-2 text-muted hover:bg-white/5 transition-colors disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-primary mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              placeholder="Netflix, Spotify, etc."
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-primary mb-1.5">
              Category
            </label>
            <select
              id="category"
              {...register('category')}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-primary mb-1.5">
              Amount <span className="text-rose-400">*</span>
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount')}
              placeholder="9.99"
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            />
            {errors.amount && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.amount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="periodLength" className="block text-sm font-medium text-primary mb-1.5">
                Repeats Every <span className="text-rose-400">*</span>
              </label>
              <input
                id="periodLength"
                type="number"
                min="1"
                {...register('periodLength')}
                className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
              />
              {errors.periodLength && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.periodLength.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="periodType" className="block text-sm font-medium text-primary mb-1.5">
                Period <span className="text-rose-400">*</span>
              </label>
              <select
                id="periodType"
                {...register('periodType')}
                className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
              >
                {PERIOD_TYPES.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              {errors.periodType && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.periodType.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="nextPayment" className="block text-sm font-medium text-primary mb-1.5">
              Next Payment Date <span className="text-rose-400">*</span>
            </label>
            <input
              id="nextPayment"
              type="date"
              {...register('nextPayment')}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            />
            {errors.nextPayment && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.nextPayment.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1.5">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              placeholder="Optional notes about this subscription..."
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)] resize-none"
            />
            {errors.notes && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.notes.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`h-10 w-10 rounded-lg transition-all duration-200 ${
                    selectedColor === color
                      ? 'ring-2 ring-[rgba(var(--accent-from-rgb),0.5)] ring-offset-2 ring-offset-[#0a0a0a] scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            {errors.color && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.color.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={createSubscription.isPending}
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSubscription.isPending}
              className="flex-1 accent-gradient rounded-xl px-4 py-2.5 text-sm font-semibold text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.35)] transition-all hover:shadow-[0_0_24px_rgba(var(--accent-to-rgb),0.45)] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createSubscription.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Subscription'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
