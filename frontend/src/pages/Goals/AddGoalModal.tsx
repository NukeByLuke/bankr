import { useState } from 'react';
import { X, Save, Target, TrendingUp, Calendar, Infinity } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { format } from 'date-fns';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().positive('Target amount must be greater than 0'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

const colorSwatches = [
  '#5af0c8', // Mint
  '#3be8a0', // Sea Green
  '#60a5fa', // Blue
  '#a78bfa', // Purple
  '#f472b6', // Pink
  '#fb923c', // Orange
  '#fbbf24', // Yellow
  '#34d399', // Emerald
  '#38bdf8', // Sky
  '#f87171', // Red
  '#a3a3a3', // Gray
  '#facc15', // Amber
];

export default function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const queryClient = useQueryClient();
  const [goalType, setGoalType] = useState<'SAVINGS' | 'EXPENSE'>('SAVINGS');
  const [selectedColor, setSelectedColor] = useState(colorSwatches[0]);
  const [hasEndDate, setHasEndDate] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      startDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/goals', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      reset();
      setSelectedColor(colorSwatches[0]);
      setGoalType('SAVINGS');
      setHasEndDate(false);
      onClose();
    },
  });

  const onSubmit = (data: GoalFormData) => {
    const payload = {
      ...data,
      type: goalType,
      color: selectedColor,
      endDate: hasEndDate && data.endDate ? data.endDate : null,
      currentAmount: 0,
    };

    createGoalMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] m-4 animate-[fadeInUp_0.4s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f0f0f]/95 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-gray-100">Create New Goal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Goal Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Goal Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGoalType('SAVINGS')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300
                  ${goalType === 'SAVINGS'
                    ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.3)]'
                    : 'bg-[#0f0f0f]/60 border border-white/5 text-gray-400 hover:border-white/10'
                  }
                `}
              >
                <TrendingUp className="w-5 h-5" />
                Savings Goal
              </button>
              <button
                type="button"
                onClick={() => setGoalType('EXPENSE')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300
                  ${goalType === 'EXPENSE'
                    ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.3)]'
                    : 'bg-[#0f0f0f]/60 border border-white/5 text-gray-400 hover:border-white/10'
                  }
                `}
              >
                <Target className="w-5 h-5" />
                Expense Goal
              </button>
            </div>
          </div>

          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Goal Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 bg-[#0f0f0f]/60 backdrop-blur-md border border-white/5 rounded-xl text-gray-100 focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)] transition-colors"
              placeholder={goalType === 'SAVINGS' ? 'e.g., Trip Savings Jar' : 'e.g., Pay Off Credit Card'}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-rose-400">{errors.name.message}</p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Color</label>
            <div className="grid grid-cols-6 gap-3">
              {colorSwatches.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-full aspect-square rounded-lg transition-all duration-300
                    ${selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-[#0b0b0b] scale-110 shadow-[0_0_15px_rgba(var(--accent-to-rgb),0.4)]'
                      : 'hover:scale-105'
                    }
                  `}
                  style={{
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Target Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                {...register('targetAmount', { valueAsNumber: true })}
                className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f]/60 backdrop-blur-md border border-white/5 rounded-xl text-gray-100 text-lg font-semibold focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)] transition-colors"
                placeholder="0.00"
              />
            </div>
            {errors.targetAmount && (
              <p className="mt-2 text-sm text-rose-400">{errors.targetAmount.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Start Date</label>
            <div className="relative">
              <Calendar className="absolute inset-y-0 left-0 flex items-center pl-4 w-5 h-5 text-gray-400 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="date"
                {...register('startDate')}
                className="w-full pl-12 pr-4 py-3 bg-[#0f0f0f]/60 backdrop-blur-md border border-white/5 rounded-xl text-gray-100 focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)] transition-colors"
              />
            </div>
            {errors.startDate && (
              <p className="mt-2 text-sm text-rose-400">{errors.startDate.message}</p>
            )}
          </div>

          {/* End Date Toggle */}
          <div>
            <button
              type="button"
              onClick={() => {
                setHasEndDate(!hasEndDate);
                if (hasEndDate) setValue('endDate', '');
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#0f0f0f]/60 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {hasEndDate ? (
                  <Calendar className="w-5 h-5 text-[var(--accent-from)]" />
                ) : (
                  <Infinity className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-100">
                  {hasEndDate ? 'Set target deadline' : 'No deadline'}
                </span>
              </div>
            </button>

            {hasEndDate && (
              <input
                type="date"
                {...register('endDate')}
                className="w-full mt-3 px-4 py-3 bg-[#0f0f0f]/60 backdrop-blur-md border border-white/5 rounded-xl text-gray-100 focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)] transition-colors"
              />
            )}
          </div>

          {/* Error Message */}
          {createGoalMutation.isError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-sm text-rose-400">
                Failed to create goal. Please try again.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createGoalMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] font-semibold rounded-xl shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent-to-rgb),0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {createGoalMutation.isPending ? 'Creating...' : 'Save Goal'}
          </button>
        </form>
      </div>
    </div>
  );
}
