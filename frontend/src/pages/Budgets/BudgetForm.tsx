import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Calendar as CalendarIcon, FileText, RefreshCw } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { BudgetTypeSelector } from './BudgetTypeSelector';
import { CategorySelector } from './CategorySelector';

const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['EXPENSE', 'SAVINGS']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string(),
  trackingType: z.enum(['ADDED_ONLY', 'ALL_TRANSACTIONS']),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  onSubmit: (data: BudgetFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [budgetType, setBudgetType] = React.useState<'EXPENSE' | 'SAVINGS'>('EXPENSE');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      type: 'EXPENSE',
      color: '#5af0c8',
      period: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      trackingType: 'ALL_TRANSACTIONS',
      categories: [],
    },
  });

  const selectedColor = watch('color');
  const selectedTrackingType = watch('trackingType');
  const selectedCategories = watch('categories');

  const handleTypeChange = (type: 'EXPENSE' | 'SAVINGS') => {
    setBudgetType(type);
    setValue('type', type);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Budget Type Toggle */}
      <div className="flex gap-2 p-1 bg-[#0f0f0f] rounded-xl border border-white/5">
        <button
          type="button"
          onClick={() => handleTypeChange('EXPENSE')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
            budgetType === 'EXPENSE'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          💸 Expense Budget
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('SAVINGS')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
            budgetType === 'SAVINGS'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          🎯 Savings Budget
        </button>
      </div>

      {/* Budget Name */}
      <div>
        <label className="label">
          <FileText className="w-4 h-4 inline mr-1" />
          Budget Name
        </label>
        <input
          type="text"
          {...register('name')}
          className="input"
          placeholder="e.g., Monthly Groceries"
        />
        {errors.name && (
          <p className="text-error text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Amount & Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            className="input text-xl font-semibold"
            placeholder="500.00"
          />
          {errors.amount && (
            <p className="text-error text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="label">
            <RefreshCw className="w-4 h-4 inline mr-1" />
            Period
          </label>
          <select {...register('period')} className="input">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label className="label">
          <CalendarIcon className="w-4 h-4 inline mr-1" />
          Start Date
        </label>
        <input type="date" {...register('startDate')} className="input" />
      </div>

      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorSelect={(color) => setValue('color', color)}
      />

      {/* Tracking Type */}
      <BudgetTypeSelector
        selectedType={selectedTrackingType}
        onTypeSelect={(type) => setValue('trackingType', type)}
      />

      {/* Category Selector */}
      <CategorySelector
        selectedCategories={selectedCategories}
        onCategoriesChange={(categories) => setValue('categories', categories)}
      />
      {errors.categories && (
        <p className="text-error text-sm">{errors.categories.message}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
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
          className="flex-1 btn accent-gradient text-black shadow-[0_0_20px_rgba(var(--accent-from-rgb),0.25)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            'Create Budget'
          )}
        </button>
      </div>
    </form>
  );
};
