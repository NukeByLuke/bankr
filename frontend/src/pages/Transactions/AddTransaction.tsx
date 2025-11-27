import { useEffect, useState } from 'react';
import { X, DollarSign, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import DateSelector from './components/DateSelector';
import RepeatSelector from './components/RepeatSelector';
import TransactionTypeSelector, { TransactionType } from './components/TransactionTypeSelector';
import CategorySelector from './components/CategorySelector';

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
}

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  merchant: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const normalizeToMidday = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
};

export default function AddTransaction({ isOpen, onClose, initialDate }: AddTransactionProps) {
  const queryClient = useQueryClient();
  const [transactionMode, setTransactionMode] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [transactionType, setTransactionType] = useState<TransactionType>('default');
  const [selectedDate, setSelectedDate] = useState(() => normalizeToMidday(initialDate));
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Recurrence state
  const [recurrence, setRecurrence] = useState({
    enabled: false,
    interval: 1,
    period: 'month' as 'day' | 'week' | 'month' | 'year',
    endDate: null as Date | null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      category: '',
    },
  });

  const category = watch('category');

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(normalizeToMidday(initialDate));
    }
  }, [initialDate, isOpen]);

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/transactions', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'summary'] });
      reset();
      setTransactionType('default');
      setRecurrence({ enabled: false, interval: 1, period: 'month', endDate: null });
      setSelectedDate(normalizeToMidday(initialDate));
      onClose();
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    const payload = {
      ...data,
      date: selectedDate.toISOString(),
      isRecurring: recurrence.enabled || transactionType === 'subscription' || transactionType === 'repetitive',
      transactionType,
      recurrence: recurrence.enabled ? recurrence : undefined,
    };

    createTransactionMutation.mutate(payload);
  };

  const handleModeChange = (mode: 'INCOME' | 'EXPENSE') => {
    setTransactionMode(mode);
    setValue('type', mode);
    setValue('category', ''); // Reset category when switching modes
  };

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);

    // Auto-enable recurrence for subscription/repetitive types
    if (type === 'subscription' || type === 'repetitive') {
      setRecurrence((prev) => ({ ...prev, enabled: true }));
      setShowMoreOptions(true);
    }

    // Set future date for upcoming transactions
    if (type === 'upcoming') {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      setSelectedDate(normalizeToMidday(futureDate));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="surface-overlay m-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-[fadeInUp_0.4s_ease-out]">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-semibold text-primary">Add Transaction</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Income/Expense Toggle */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleModeChange('EXPENSE')}
              className={`
                flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300
                ${transactionMode === 'EXPENSE'
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  : 'glass-input text-muted'
                }
              `}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('INCOME')}
              className={`
                flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300
                ${transactionMode === 'INCOME'
                  ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.3)]'
                  : 'glass-input text-muted'
                }
              `}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-3 block text-sm font-medium text-muted">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <DollarSign className="h-5 w-5 text-muted" />
              </div>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="glass-input w-full rounded-xl pl-12 pr-4 py-3 text-lg font-semibold focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)]"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-sm text-rose-400">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-3 block text-sm font-medium text-muted">Description</label>
            <input
              type="text"
              {...register('description')}
              className="glass-input w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)]"
              placeholder="What's this transaction for?"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-rose-400">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <CategorySelector
            value={category}
            onChange={(cat) => setValue('category', cat)}
            type={transactionMode}
          />
          {errors.category && (
            <p className="text-sm text-rose-400">{errors.category.message}</p>
          )}

          {/* Transaction Type */}
          <TransactionTypeSelector value={transactionType} onChange={handleTypeChange} />

          {/* Date Selector */}
          <DateSelector value={selectedDate} onChange={(date) => setSelectedDate(normalizeToMidday(date))} />

          {/* Merchant (Optional) */}
          <div>
            <label className="mb-3 block text-sm font-medium text-muted">
              Merchant <span className="text-muted">(optional)</span>
            </label>
            <input
              type="text"
              {...register('merchant')}
              className="glass-input w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)]"
              placeholder="Store or service name"
            />
          </div>

          {/* More Options Toggle */}
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="glass-input w-full rounded-xl px-4 py-3 text-sm font-medium text-muted transition-all duration-300 hover:shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.15)]"
          >
            {showMoreOptions ? 'Less Options' : 'More Options'}
          </button>

          {/* Expanded Options */}
          {showMoreOptions && (
            <div className="space-y-4 animate-[fadeInUp_0.3s_ease-out]">
              {/* Repeat Selector */}
              <RepeatSelector
                enabled={recurrence.enabled}
                interval={recurrence.interval}
                period={recurrence.period}
                endDate={recurrence.endDate}
                onChange={setRecurrence}
              />

              {/* Notes */}
              <div>
                <label className="mb-3 block text-sm font-medium text-muted">
                  Notes <span className="text-muted">(optional)</span>
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="glass-input w-full resize-none rounded-xl px-4 py-3 focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)]"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {createTransactionMutation.isError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-sm text-rose-400">
                Failed to create transaction. Please try again.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createTransactionMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] font-semibold rounded-xl shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent-to-rgb),0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {createTransactionMutation.isPending ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
