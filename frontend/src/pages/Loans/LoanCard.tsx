import { useMemo } from 'react';
import { CalendarDays, Loader2, Trash2 } from 'lucide-react';
import { differenceInCalendarDays, format, isAfter } from 'date-fns';

export interface LoanRecord {
  id: string;
  name: string;
  type: 'lent' | 'borrowed' | string;
  amount: number;
  color?: string | null;
  notes?: string | null;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LoanCardProps {
  loan: LoanRecord;
  onDelete: () => void;
  isDeleting: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return format(parsed, 'MMM d, yyyy');
};

export default function LoanCard({ loan, onDelete, isDeleting }: LoanCardProps) {
  const isLongTerm = Boolean(loan.endDate);
  const amountColor = loan.type === 'lent' ? 'text-[var(--accent-from)]' : 'text-rose-400';
  const typeLabel = loan.type === 'lent' ? 'Lent' : loan.type === 'borrowed' ? 'Borrowed' : loan.type;

  const timeline = useMemo(() => {
    if (!loan.endDate) return null;
    const start = new Date(loan.startDate);
    const end = new Date(loan.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    if (!isAfter(end, start)) return null;

    const now = new Date();
    const total = end.getTime() - start.getTime();
    const clamped = Math.min(Math.max(now.getTime() - start.getTime(), 0), total);
    const percent = Math.round((clamped / total) * 100);
    const remainingDays = Math.max(differenceInCalendarDays(end, now), 0);

    return {
      percent,
      remainingDays,
      hasEnded: now > end,
      start,
      end,
    };
  }, [loan.endDate, loan.startDate]);

  const accentStyle = loan.color
    ? {
        background: `linear-gradient(135deg, ${loan.color}26 0%, transparent 65%)`,
      }
    : undefined;

  return (
  <article className="glass-card relative overflow-hidden rounded-2xl p-6 shadow-glass transition-all duration-300 hover:shadow-[0_0_24px_rgba(var(--accent-from-rgb),0.18)]">
      {accentStyle && <div className="pointer-events-none absolute inset-0" style={accentStyle} />}

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <span className="rounded-full bg-black/5 px-3 py-1 text-[0.7rem] dark:bg-white/5">
              {typeLabel}
            </span>
            <span className="rounded-full bg-black/5 px-3 py-1 text-[0.7rem] dark:bg-white/5">
              {isLongTerm ? 'Long term' : 'One time'}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-primary">{loan.name}</h3>
          <p className={`mt-2 text-2xl font-semibold ${amountColor}`}>
            {loan.type === 'borrowed' ? `-${formatCurrency(loan.amount)}` : formatCurrency(loan.amount)}
          </p>
        </div>

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-xl border border-transparent bg-black/5 p-2 text-muted transition-colors hover:border-rose-400/50 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5"
          aria-label={`Delete loan ${loan.name}`}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      <dl className="relative mt-6 grid grid-cols-1 gap-4 text-sm text-muted sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl bg-black/5 px-4 py-3 dark:bg-white/5">
          <CalendarDays className="h-4 w-4" />
          <div>
            <dt className="text-xs uppercase tracking-wide">Start date</dt>
            <dd className="text-primary">{formatDate(loan.startDate)}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-black/5 px-4 py-3 dark:bg-white/5">
          <CalendarDays className="h-4 w-4" />
          <div>
            <dt className="text-xs uppercase tracking-wide">End date</dt>
            <dd className="text-primary">{formatDate(loan.endDate)}</dd>
          </div>
        </div>
      </dl>

      {loan.notes && (
        <p className="relative mt-4 rounded-xl bg-black/5 px-4 py-3 text-sm text-muted line-clamp-3 dark:bg-white/5">
          {loan.notes}
        </p>
      )}

      {timeline && (
        <div className="relative mt-6">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{formatDate(loan.startDate)}</span>
            <span>{formatDate(loan.endDate)}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${loan.type === 'lent' ? 'bg-[var(--accent-from)]' : 'bg-rose-400'} transition-all duration-500`}
              style={{ width: `${Math.min(Math.max(timeline.percent, 0), 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>{timeline.percent}% complete</span>
            <span>
              {timeline.hasEnded
                ? 'Finished'
                : `${timeline.remainingDays} day${timeline.remainingDays === 1 ? '' : 's'} remaining`}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
