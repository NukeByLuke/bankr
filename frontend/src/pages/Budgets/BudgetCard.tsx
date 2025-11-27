import React from 'react';
import { formatCurrency } from '@/utils/helpers';
import { MoreVertical, TrendingDown, TrendingUp } from 'lucide-react';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  type: 'EXPENSE' | 'SAVINGS';
  color: string;
  period: string;
}

interface BudgetCardProps {
  budget: Budget;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
}) => {
  const remaining = budget.amount - budget.spent;
  const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
  const isOverBudget = budget.spent > budget.amount;

  return (
    <div className="group bg-[#0f0f0f]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.25)] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Color swatch */}
          <div
            className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-[#0f0f0f] transition-all group-hover:scale-110"
            style={{
              backgroundColor: budget.color,
              boxShadow: `0 0 12px ${budget.color}40`,
            }}
          />
          
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
              {budget.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {budget.type === 'EXPENSE' ? (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <TrendingDown className="w-3 h-3" />
                  <span>Expense</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>Savings</span>
                </div>
              )}
              <span className="text-xs text-gray-500">• {budget.period}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Amount info */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className={`text-2xl font-bold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(remaining)}
          </span>
          <span className="text-gray-500 text-sm ml-2">remaining</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">
            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-secondary-900 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            isOverBudget
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)]'
          }`}
          style={{
            width: `${percentage}%`,
            boxShadow: isOverBudget
              ? '0 0 12px rgba(239,68,68,0.5)'
              : '0 0 12px rgba(var(--accent-to-rgb),0.5)',
          }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-2 text-right">
        <span className={`text-xs font-medium ${isOverBudget ? 'text-red-400' : 'text-gray-500'}`}>
          {percentage.toFixed(0)}% {isOverBudget ? 'over budget' : 'used'}
        </span>
      </div>
    </div>
  );
};
