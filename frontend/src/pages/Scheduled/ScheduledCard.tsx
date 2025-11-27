import { Calendar, Tag, Trash2, Loader2, TrendingUp, TrendingDown, Repeat } from 'lucide-react';
import { formatDistance, format } from 'date-fns';

export interface ScheduledRecord {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  type: string;
  date: string;
  repeatType: string | null;
  repeatEvery: number | null;
  color: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ScheduledCardProps {
  scheduled: ScheduledRecord;
  onDelete: () => void;
  isDeleting?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

const formatRepeat = (repeatType: string | null, repeatEvery: number | null): string => {
  if (!repeatType || repeatType === 'none' || !repeatEvery) return 'One-time';
  const plural = repeatEvery > 1 ? 's' : '';
  return `Every ${repeatEvery} ${repeatType}${plural}`;
};

export default function ScheduledCard({
  scheduled,
  onDelete,
  isDeleting = false,
}: ScheduledCardProps) {
  const { title, amount, category, type, date, repeatType, repeatEvery, notes, color, status } = scheduled;

  const scheduledDate = new Date(date);
  const isOverdue = status === 'overdue';
  const isUpcoming = status === 'upcoming';
  const timeUntil = isUpcoming
    ? formatDistance(scheduledDate, new Date(), { addSuffix: true })
    : 'Overdue';

  const typeColor = type === 'income' ? 'text-[var(--accent-from)]' : 'text-rose-400';
  const TypeIcon = type === 'income' ? TrendingUp : TrendingDown;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-glass hover-glow transition-all duration-300 group relative">
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: color || 'var(--accent-from)' }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TypeIcon className={`h-4 w-4 ${typeColor}`} />
            <h3 className="truncate text-lg font-semibold text-primary">{title}</h3>
          </div>
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
          aria-label="Delete scheduled transaction"
        >
          {isDeleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="mt-4">
        <p className={`text-2xl font-bold ${typeColor}`}>
          {type === 'income' ? '+' : '-'}{formatCurrency(amount)}
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted" />
          <span className="text-muted">
            {format(scheduledDate, 'MMM dd, yyyy')}
          </span>
        </div>

        {repeatType && repeatType !== 'none' && (
          <div className="flex items-center gap-2 text-sm">
            <Repeat className="h-4 w-4 text-muted" />
            <span className="text-muted">{formatRepeat(repeatType, repeatEvery)}</span>
          </div>
        )}
      </div>

      <div
        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
          isOverdue
            ? 'bg-rose-500/10 text-rose-400'
            : isUpcoming
      ? 'bg-[rgba(var(--accent-from-rgb),0.12)] text-[var(--accent-from)]'
            : 'bg-blue-500/10 text-blue-400'
        }`}
      >
        {timeUntil}
      </div>

      {notes && (
        <p className="mt-3 text-sm text-muted line-clamp-2">{notes}</p>
      )}
    </div>
  );
}
