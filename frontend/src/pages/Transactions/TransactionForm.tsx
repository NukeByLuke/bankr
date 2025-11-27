import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DollarSign,
  Calendar as CalendarIcon,
  FileText,
  Tag,
  Paperclip,
} from 'lucide-react';

const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  date: z.string(),
  notes: z.string().optional(),
  transactionType: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const categories = [
  'FOOD',
  'SHOPPING',
  'HOUSING',
  'TRANSPORTATION',
  'UTILITIES',
  'HEALTHCARE',
  'ENTERTAINMENT',
  'INVESTMENT',
  'SALARY',
  'BUSINESS',
  'OTHER',
];

const transactionTypes = [
  'Default',
  'Upcoming',
  'Subscription',
  'Repetitive',
  'Lent',
  'Borrowed',
];

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [activeType, setActiveType] = React.useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      transactionType: 'Default',
    },
  });

  const selectedTransactionType = watch('transactionType');

  const handleTypeChange = (type: 'INCOME' | 'EXPENSE') => {
    setActiveType(type);
    setValue('type', type);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Income/Expense Toggle */}
      <div className="flex gap-2 p-1 bg-secondary-900 rounded-lg">
        <button
          type="button"
          onClick={() => handleTypeChange('EXPENSE')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
            activeType === 'EXPENSE'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('INCOME')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
            activeType === 'INCOME'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Income
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label className="label">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          className="input text-2xl font-semibold"
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-error text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="label">
          <FileText className="w-4 h-4 inline mr-1" />
          Title
        </label>
        <input
          type="text"
          {...register('title')}
          className="input"
          placeholder="e.g., Grocery shopping"
        />
        {errors.title && (
          <p className="text-error text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="label">
          <CalendarIcon className="w-4 h-4 inline mr-1" />
          Date
        </label>
        <input type="date" {...register('date')} className="input" />
        {errors.date && (
          <p className="text-error text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="label">
          <Tag className="w-4 h-4 inline mr-1" />
          Category
        </label>
        <select {...register('category')} className="input">
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-error text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Transaction Type Tags */}
      <div>
        <label className="label mb-3">Transaction Type</label>
        <div className="flex flex-wrap gap-2">
          {transactionTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('transactionType', type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTransactionType === type
                  ? 'bg-[var(--accent-from)] text-[color-mix(in_srgb,var(--accent-from)_20%,black)] shadow-lg shadow-[rgba(var(--accent-from-rgb),0.25)]'
                  : 'bg-secondary-800 text-gray-400 hover:bg-secondary-700 hover:text-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes (Optional)</label>
        <textarea
          {...register('notes')}
          className="input min-h-[80px] resize-none"
          placeholder="Add any additional details..."
        />
      </div>

      {/* Attachment (placeholder) */}
      <div>
        <label className="label">
          <Paperclip className="w-4 h-4 inline mr-1" />
          Attachment (Optional)
        </label>
  <div className="border-2 border-dashed border-secondary-700 rounded-lg p-6 text-center hover:border-[rgba(var(--accent-from-rgb),0.3)] transition-colors cursor-pointer">
          <p className="text-sm text-gray-500">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-600 mt-1">
            PNG, JPG, PDF up to 10MB
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn btn-ghost"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            'Save Transaction'
          )}
        </button>
      </div>
    </form>
  );
};
