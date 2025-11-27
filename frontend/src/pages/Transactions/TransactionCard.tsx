import React from 'react';
import { formatCurrency, formatDate } from '@/utils/helpers';
import {
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Heart,
  Zap,
  TrendingUp,
  Wallet,
  Trash2,
  Edit,
  Gift,
  Plane,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  SHOPPING: <ShoppingBag className="w-5 h-5" />,
  HOUSING: <Home className="w-5 h-5" />,
  TRANSPORT: <Car className="w-5 h-5" />,
  TRANSPORTATION: <Car className="w-5 h-5" />,
  FOOD: <Utensils className="w-5 h-5" />,
  HEALTHCARE: <Heart className="w-5 h-5" />,
  UTILITIES: <Zap className="w-5 h-5" />,
  INVESTMENT: <TrendingUp className="w-5 h-5" />,
  INVESTMENTS: <TrendingUp className="w-5 h-5" />,
  SALARY: <Briefcase className="w-5 h-5" />,
  BUSINESS: <Briefcase className="w-5 h-5" />,
  FREELANCE: <Briefcase className="w-5 h-5" />,
  GIFTS: <Gift className="w-5 h-5" />,
  TRAVEL: <Plane className="w-5 h-5" />,
  EDUCATION: <GraduationCap className="w-5 h-5" />,
  OTHER: <Wallet className="w-5 h-5" />,
};

const formatCategoryLabel = (category: string) =>
  category
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const isIncome = transaction.type === 'INCOME';
  const icon = categoryIcons[transaction.category] || categoryIcons.OTHER;
  const rawAmount =
    typeof transaction.amount === 'string'
      ? parseFloat(transaction.amount)
      : transaction.amount;
  const amountValue = Number.isNaN(rawAmount) ? 0 : rawAmount;
  return (
  <div className="group relative isolate z-10 flex items-center gap-4 rounded-2xl glass-card p-4 transition-all duration-300 hover:z-50 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(var(--accent-from-rgb),0.25)]">
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ${
          isIncome
            ? 'bg-[rgba(var(--accent-from-rgb),0.15)] text-[var(--accent-from)]'
            : 'bg-rose-500/15 text-rose-400'
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-4">
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold transition-colors duration-300 group-hover:text-[var(--accent-to)]">
                {transaction.title}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{formatDate(transaction.date)}</span>
                <span className="h-1 w-1 rounded-full bg-current/30" />
                <span className="rounded-full border border-subtle px-2 py-0.5 uppercase tracking-wide">
                  {formatCategoryLabel(transaction.category)}
                </span>
              </div>
            </div>
          </div>

          {transaction.notes && (
            <p className="line-clamp-1 text-sm text-muted">
              {transaction.notes}
            </p>
          )}
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
  <p className={`text-lg font-semibold ${isIncome ? 'text-[var(--accent-from)]' : 'text-rose-500'}`}>
          {isIncome ? '+' : '−'}
          {formatCurrency(Math.abs(amountValue))}
        </p>
        <div className="flex items-center gap-2 sm:gap-3">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction.id)}
              className="relative z-20 flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted transition-all duration-200 hover:bg-black/10 hover:text-primary dark:bg-white/10 dark:hover:bg-white/20"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className="relative z-20 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-rose-500 shadow-[0_0_10px_rgba(0,0,0,0.25)] transition-all duration-200 hover:scale-[1.03] hover:bg-red-500/20 dark:text-rose-300"
              aria-label="Delete transaction"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
