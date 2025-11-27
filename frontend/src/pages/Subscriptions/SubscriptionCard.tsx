import { Calendar, Tag, Trash2, Loader2 } from 'lucide-react';
import { formatDistance, format } from 'date-fns';

export interface SubscriptionRecord {
  id: string;
  title: string;
  category: string | null;
  amount: number;
  periodLength: number;
  periodType: string;
  nextPayment: string;
  active: boolean;
  notes: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionCardProps {
  subscription: SubscriptionRecord;
  onDelete: () => void;
  isDeleting?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

const formatFrequency = (periodLength: number, periodType: string): string => {
  const normalized = periodType.toLowerCase();
  const plural = periodLength > 1 ? 's' : '';
  return `Every ${periodLength} ${normalized}${plural}`;
};

export default function SubscriptionCard({
  subscription,
  onDelete,
  isDeleting = false,
}: SubscriptionCardProps) {
  const { title, category, amount, periodLength, periodType, nextPayment, notes, color } = subscription;

  const nextDate = new Date(nextPayment);
  const isUpcoming = nextDate.getTime() > Date.now();
  const daysUntil = isUpcoming
    ? formatDistance(nextDate, new Date(), { addSuffix: true })
    : 'Overdue';

  return (
    <div className="glass-card rounded-2xl p-5 shadow-glass hover-glow transition-all duration-300 group relative">
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-lg font-semibold text-primary">{title}</h3>
          {category && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Tag className="h-3.5 w-3.5" />
              <span className="truncate">{category}</span>
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Delete subscription"
        >
          {isDeleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-[var(--accent-from)]">{formatCurrency(amount)}</p>
          <p className="mt-1 text-xs text-muted">{formatFrequency(periodLength, periodType)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-muted" />
        <span className="text-muted">
          Next: {format(nextDate, 'MMM dd, yyyy')}
        </span>
      </div>

      <div
        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
          isUpcoming
            ? 'bg-[rgba(var(--accent-from-rgb),0.12)] text-[var(--accent-from)]'
            : 'bg-rose-500/10 text-rose-400'
        }`}
      >
        {daysUntil}
      </div>

      {notes && (
        <p className="mt-3 text-sm text-muted line-clamp-2">{notes}</p>
      )}
    </div>
  );
}
