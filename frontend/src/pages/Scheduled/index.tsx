import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2 } from 'lucide-react';
import { apiClient } from '@/utils/api';
import AddScheduledModal from './AddScheduledModal';
import ScheduledCard, { ScheduledRecord } from './ScheduledCard';

const PERIOD_TABS = [
  { label: 'Monthly', value: 'monthly' as const },
  { label: 'Yearly', value: 'yearly' as const },
  { label: 'Total', value: 'total' as const },
];

const STATUS_TABS = [
  { label: 'All', value: 'all' as const },
  { label: 'Upcoming', value: 'upcoming' as const },
  { label: 'Overdue', value: 'overdue' as const },
];

const SORT_OPTIONS = [
  'Date',
  'Highest Amount',
  'Lowest Amount',
  'Title A-Z',
] as const;

type PeriodFilter = (typeof PERIOD_TABS)[number]['value'];
type StatusFilter = (typeof STATUS_TABS)[number]['value'];
type ScheduledSort = (typeof SORT_OPTIONS)[number];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

export default function Scheduled() {
  const queryClient = useQueryClient();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('monthly');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<ScheduledSort>('Date');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<ScheduledRecord[]>({
    queryKey: ['scheduled'],
    queryFn: async () => {
      const response = await apiClient.get('/scheduled');
      return response.data as ScheduledRecord[];
    },
  });

  const scheduled = data ?? [];

  // Update status based on date
  const scheduledWithStatus = useMemo(() => {
    const now = new Date();
    return scheduled.map((item) => {
      const itemDate = new Date(item.date);
      if (itemDate < now && item.status === 'upcoming') {
        return { ...item, status: 'overdue' };
      }
      return item;
    });
  }, [scheduled]);

  const totals = useMemo(() => {
    return scheduledWithStatus.reduce(
      (acc, item) => {
        const amount = item.type === 'income' ? item.amount : -item.amount;
        acc.total += amount;
        
        // Calculate monthly/yearly averages based on repeat type
        if (item.repeatType && item.repeatType !== 'none' && item.repeatEvery) {
          switch (item.repeatType) {
            case 'monthly':
              acc.monthly += amount / item.repeatEvery;
              acc.yearly += (amount * 12) / item.repeatEvery;
              break;
            case 'yearly':
              acc.yearly += amount / item.repeatEvery;
              acc.monthly += amount / (item.repeatEvery * 12);
              break;
            case 'weekly':
              acc.monthly += (amount * 4) / item.repeatEvery;
              acc.yearly += (amount * 52) / item.repeatEvery;
              break;
            case 'daily':
              acc.monthly += (amount * 30) / item.repeatEvery;
              acc.yearly += (amount * 365) / item.repeatEvery;
              break;
          }
        } else {
          // One-time transaction
          acc.oneTime += amount;
        }
        
        return acc;
      },
      { monthly: 0, yearly: 0, total: 0, oneTime: 0 }
    );
  }, [scheduledWithStatus]);

  const filteredScheduled = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = scheduledWithStatus.filter((item) => {
      // Status filter
      if (statusFilter === 'upcoming' && item.status !== 'upcoming') return false;
      if (statusFilter === 'overdue' && item.status !== 'overdue') return false;

      // Search filter
      if (normalizedSearch) {
        const haystack = `${item.title} ${item.category ?? ''} ${item.notes ?? ''}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Highest Amount':
          return b.amount - a.amount;
        case 'Lowest Amount':
          return a.amount - b.amount;
        case 'Title A-Z':
          return a.title.localeCompare(b.title);
        case 'Date':
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });
  }, [scheduledWithStatus, statusFilter, searchTerm, sortBy]);

  const deleteScheduled = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/scheduled/${id}`);
    },
    onMutate: (id) => {
      setPendingDeletionId(id);
    },
    onError: () => {
      setPendingDeletionId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
    },
    onSettled: () => {
      setPendingDeletionId(null);
    },
  });

  const handleDelete = (item: ScheduledRecord) => {
    const confirmed = window.confirm(`Delete ${item.title}? This action cannot be undone.`);
    if (!confirmed) return;
    deleteScheduled.mutate(item.id);
  };

  const displayTotal = periodFilter === 'monthly' ? totals.monthly : periodFilter === 'yearly' ? totals.yearly : totals.total;

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Scheduled</h1>
            <p className="mt-2 text-sm text-muted">
              Manage upcoming and recurring transactions.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search scheduled..."
              className="glass-input w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            />
          </div>
        </header>

        <section className="glass-card rounded-2xl p-6 shadow-glass">
          <p className="text-sm text-muted">
            {periodFilter === 'monthly' ? 'Averaged Monthly' : periodFilter === 'yearly' ? 'Averaged Yearly' : 'Total'} Upcoming
          </p>
          <p className={`mt-2 text-3xl font-semibold ${displayTotal >= 0 ? 'text-[var(--accent-from)]' : 'text-rose-400'}`}>
            {formatCurrency(displayTotal)}
          </p>
        </section>

        <div className="glass-card rounded-2xl p-5 shadow-glass space-y-4">
          <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-white/10">
            {PERIOD_TABS.map(({ label, value }) => {
              const isActive = periodFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setPeriodFilter(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-from-rgb),0.4)] ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.35)]'
                      : 'glass-input text-muted hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {STATUS_TABS.map(({ label, value }) => {
                const isActive = statusFilter === value;
                return (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-from-rgb),0.4)] ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_12px_rgba(var(--accent-to-rgb),0.25)]'
                        : 'glass-input text-muted hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted">Sort</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ScheduledSort)}
                className="glass-input rounded-xl px-3 py-2 text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isError && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-300">
            Failed to load scheduled transactions.{' '}
            {error instanceof Error ? error.message : 'Please try again shortly.'}
          </div>
        )}

        {!isError && (
          <section className="min-h-[240px]">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-muted">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredScheduled.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-muted">
                <h2 className="text-xl font-semibold text-primary">No scheduled transactions yet</h2>
                <p className="mt-2 text-sm">
                  Add your first scheduled transaction to track upcoming payments and income.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredScheduled.map((item) => (
                  <ScheduledCard
                    key={item.id}
                    scheduled={item}
                    onDelete={() => handleDelete(item)}
                    isDeleting={pendingDeletionId === item.id && deleteScheduled.isPending}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
  className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full accent-gradient text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_30px_rgba(var(--accent-to-rgb),0.45)] transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Add scheduled transaction"
      >
        <Plus className="h-8 w-8" />
      </button>

      <AddScheduledModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
