import React, { useState } from 'react';
import { formatCurrency } from '@/utils/helpers';
import { MoreVertical, TrendingDown, TrendingUp, Pencil, Trash2 } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent?: number;
  period: string;
  color?: string;
  isActive?: boolean;
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
  const [showMenu, setShowMenu] = useState(false);
  const spent = budget.spent ?? 0;
  const remaining = budget.amount - spent;
  const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const isOverBudget = spent > budget.amount;
  const displayName = budget.category?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Budget';

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
              {displayName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <TrendingUp className="w-3 h-3" />
                <span>{budget.category}</span>
              </div>
              <span className="text-xs text-gray-500">• {budget.period}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-10 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 min-w-[120px] overflow-hidden">
              <button
                onClick={() => { onEdit?.(budget.id); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => { onDelete?.(budget.id); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
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
            {formatCurrency(spent)} / {formatCurrency(budget.amount)}
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
