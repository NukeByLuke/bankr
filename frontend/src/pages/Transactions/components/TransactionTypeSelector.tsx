import { Zap, Clock, RefreshCw, Repeat, TrendingUp, TrendingDown } from 'lucide-react';

export type TransactionType = 'default' | 'upcoming' | 'subscription' | 'repetitive' | 'lent' | 'borrowed';

interface TransactionTypeSelectorProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

const types: Array<{ value: TransactionType; label: string; icon: any }> = [
  { value: 'default', label: 'Default', icon: Zap },
  { value: 'upcoming', label: 'Upcoming', icon: Clock },
  { value: 'subscription', label: 'Subscription', icon: RefreshCw },
  { value: 'repetitive', label: 'Repetitive', icon: Repeat },
  { value: 'lent', label: 'Lent', icon: TrendingUp },
  { value: 'borrowed', label: 'Borrowed', icon: TrendingDown },
];

export default function TransactionTypeSelector({ value, onChange }: TransactionTypeSelectorProps) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-muted">Transaction Type</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {types.map((type) => {
          const Icon = type.icon;
          const isActive = value === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300
                ${isActive
                  ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] border-transparent text-[color-mix(in_srgb,var(--accent-to)_15%,black)] font-semibold shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.3)]'
                  : 'glass-input text-muted hover:shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.18)]'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[color-mix(in_srgb,var(--accent-to)_10%,black)]' : 'text-muted'}`} />
              <span className="text-xs">{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
