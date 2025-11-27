import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '@/utils/api';

interface ScheduledFormData {
  title: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  repeatType: string;
  repeatEvery: number;
  color: string;
  notes: string;
}

interface AddScheduledModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PALETTE = [
  '#00ffcc',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#10b981',
  '#5af0c8',
  '#a78bfa',
  '#fb923c',
  '#fbbf24',
];

const CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Bills',
  'Rent',
  'Utilities',
  'Subscriptions',
  'Insurance',
  'Loan Payment',
  'Investment',
  'Other',
];

const REPEAT_TYPES = [
  { value: 'none', label: 'One-time' },
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

// Quick date shortcuts
const getQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek'): string => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  
  switch (type) {
    case 'today':
      return date.toISOString().split('T')[0];
    case 'tomorrow':
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    case 'nextWeek':
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    default:
      return date.toISOString().split('T')[0];
  }
};

export default function AddScheduledModal({ isOpen, onClose }: AddScheduledModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ScheduledFormData>({
    defaultValues: {
      title: '',
      amount: 0,
      category: '',
      type: 'expense',
      date: '',
      repeatType: 'none',
      repeatEvery: 1,
      color: COLOR_PALETTE[0],
      notes: '',
    },
  });

  const selectedColor = watch('color');
  const selectedType = watch('type');
  const repeatType = watch('repeatType');

  const createScheduled = useMutation({
    mutationFn: async (data: ScheduledFormData) => {
      const payload = {
        ...data,
        date: normalizeToMidday(data.date),
        category: data.category || null,
        notes: data.notes || null,
        repeatType: data.repeatType === 'none' ? null : data.repeatType,
        repeatEvery: data.repeatType === 'none' ? null : data.repeatEvery,
      };
      await apiClient.post('/scheduled', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: ScheduledFormData) => {
    if (!data.title || !data.date || data.amount <= 0) {
      return;
    }
    createScheduled.mutate(data);
  };

  const handleClose = () => {
    if (!createScheduled.isPending) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-2xl rounded-2xl p-6 shadow-glass max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold">Add Scheduled Transaction</h2>
          <button
            onClick={handleClose}
            disabled={createScheduled.isPending}
            className="rounded-lg p-2 text-muted hover:bg-white/5 transition-colors disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-primary mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: true })}
              placeholder="e.g., Rent Payment, Salary, etc."
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-400">Title is required</p>
            )}
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Type <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue('type', 'income')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  selectedType === 'income'
                    ? 'bg-[rgba(var(--accent-from-rgb),0.15)] text-[var(--accent-from)] ring-2 ring-[rgba(var(--accent-from-rgb),0.5)]'
                    : 'glass-input text-muted hover:bg-white/5'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setValue('type', 'expense')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  selectedType === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-400/50'
                    : 'glass-input text-muted hover:bg-white/5'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-primary mb-1.5">
                Amount <span className="text-rose-400">*</span>
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { required: true, min: 0.01 })}
                placeholder="0.00"
                className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
              />
              {errors.amount && (
                <p className="mt-1.5 text-xs text-rose-400">Valid amount required</p>
              )}
            </div>

            {/* Category */}
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
            </div>
          </div>

          {/* Date with Quick Shortcuts */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-primary mb-2">
              Date <span className="text-rose-400">*</span>
            </label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setValue('date', getQuickDate('today'))}
                className="glass-input rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[rgba(var(--accent-from-rgb),0.12)] hover:text-[var(--accent-from)] transition-all duration-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setValue('date', getQuickDate('tomorrow'))}
                className="glass-input rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[rgba(var(--accent-from-rgb),0.12)] hover:text-[var(--accent-from)] transition-all duration-200"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setValue('date', getQuickDate('nextWeek'))}
                className="glass-input rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[rgba(var(--accent-from-rgb),0.12)] hover:text-[var(--accent-from)] transition-all duration-200"
              >
                Next Week
              </button>
            </div>

            <input
              id="date"
              type="date"
              {...register('date', { required: true })}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            />
            {errors.date && (
              <p className="mt-1.5 text-xs text-rose-400">Date is required</p>
            )}
          </div>

          {/* Repeat Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="repeatType" className="block text-sm font-medium text-primary mb-1.5">
                Repeat
              </label>
              <select
                id="repeatType"
                {...register('repeatType')}
                className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
              >
                {REPEAT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {repeatType !== 'none' && (
              <div>
                <label htmlFor="repeatEvery" className="block text-sm font-medium text-primary mb-1.5">
                  Every
                </label>
                <input
                  id="repeatEvery"
                  type="number"
                  min="1"
                  {...register('repeatEvery', { min: 1 })}
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
                />
              </div>
            )}
          </div>

          {/* Modern Color Picker */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">Color</label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`h-12 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-[rgba(var(--accent-from-rgb),0.5)] ring-offset-[#0a0a0a] scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1.5">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              placeholder="Optional notes..."
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={createScheduled.isPending}
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createScheduled.isPending}
              className="flex-1 accent-gradient rounded-xl px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_18px_rgba(var(--accent-from-rgb),0.35)] transition-all hover:shadow-[0_0_24px_rgba(var(--accent-from-rgb),0.45)] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createScheduled.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Scheduled'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
