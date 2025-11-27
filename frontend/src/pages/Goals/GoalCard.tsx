import { Target, TrendingUp, Calendar, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAccentStore } from '@/store/accentStore';
import { Goal } from './index';

interface GoalCardProps {
  goal: Goal;
  style?: React.CSSProperties;
}

export default function GoalCard({ goal, style }: GoalCardProps) {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  const accent = useAccentStore((state) => state.accentColor);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const Icon = goal.type === 'SAVINGS' ? TrendingUp : Target;
  const cardColor = goal.color || accent.to;

  return (
    <div
      style={style}
  className="bg-[#0f0f0f]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.25)] p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.3)] hover:border-white/10 animate-[fadeInUp_0.4s_ease-out] group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${cardColor}20, ${cardColor}10)`,
              border: `1px solid ${cardColor}30`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: cardColor }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{goal.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{goal.type.toLowerCase()}</p>
          </div>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/5 rounded-lg transition-all duration-300">
          <Edit2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Progress Section */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="font-semibold text-gray-100">{progress.toFixed(1)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(var(--accent-to-rgb),0.4)]"
          />
        </div>

        {/* Amount Details */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Current</p>
            <p className="text-sm font-semibold text-gray-100">
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-sm font-semibold text-gray-100">
              {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        {/* Remaining Amount */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Remaining</span>
          <span
            className="text-sm font-semibold"
            style={{ color: remaining > 0 ? '#f59e0b' : accent.to }}
          >
            {remaining > 0 ? formatCurrency(remaining) : 'Goal Reached! 🎉'}
          </span>
        </div>

        {/* Date Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {format(new Date(goal.startDate), 'MMM dd, yyyy')}
            {goal.endDate && ` → ${format(new Date(goal.endDate), 'MMM dd, yyyy')}`}
          </span>
        </div>
      </div>
    </div>
  );
}
