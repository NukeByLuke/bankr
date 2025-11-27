import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2 } from 'lucide-react';
import { apiClient } from '@/utils/api';
import AddSubscriptionModal from './AddSubscriptionModal';
import SubscriptionCard, { SubscriptionRecord } from './SubscriptionCard';

const FILTER_TABS = [
  { label: 'All', value: 'all' as const },
  { label: 'Monthly', value: 'monthly' as const },
  { label: 'Yearly', value: 'yearly' as const },
];

const SORT_OPTIONS = [
  'Next Payment',
  'Highest Amount',
  'Lowest Amount',
  'Title A-Z',
] as const;

type SubscriptionFilter = (typeof FILTER_TABS)[number]['value'];
type SubscriptionSort = (typeof SORT_OPTIONS)[number];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

const calculateMonthlyEquivalent = (amount: number, periodType: string, periodLength: number): number => {
  const perYear = (() => {
    switch (periodType.toLowerCase()) {
      case 'daily':
        return amount * 365 / periodLength;
      case 'weekly':
        return amount * 52 / periodLength;
      case 'monthly':
        return amount * 12 / periodLength;
      case 'yearly':
        return amount / periodLength;
      default:
        return amount * 12;
    }
  })();
  return perYear / 12;
};

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<SubscriptionFilter>('all');
  const [sortBy, setSortBy] = useState<SubscriptionSort>('Next Payment');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<SubscriptionRecord[]>({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions');
      return response.data as SubscriptionRecord[];
    },
  });

  const subscriptions = data ?? [];

  const totals = useMemo(() => {
    return subscriptions.reduce(
      (acc, sub) => {
        const monthly = calculateMonthlyEquivalent(sub.amount, sub.periodType, sub.periodLength);
        acc.monthly += monthly;
        acc.yearly += monthly * 12;
        acc.total += sub.amount;
        return acc;
      },
      { monthly: 0, yearly: 0, total: 0 }
    );
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = subscriptions.filter((sub) => {
      if (filter === 'monthly' && sub.periodType.toLowerCase() !== 'monthly') {
        return false;
      }
      if (filter === 'yearly' && sub.periodType.toLowerCase() !== 'yearly') {
        return false;
      }
      if (!normalizedSearch) return true;
      const haystack = `${sub.title} ${sub.category ?? ''} ${sub.notes ?? ''}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Highest Amount':
          return b.amount - a.amount;
        case 'Lowest Amount':
          return a.amount - b.amount;
        case 'Title A-Z':
          return a.title.localeCompare(b.title);
        case 'Next Payment':
        default:
          return new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime();
      }
    });
  }, [filter, subscriptions, searchTerm, sortBy]);

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/subscriptions/${id}`);
    },
    onMutate: (id) => {
      setPendingDeletionId(id);
    },
    onError: () => {
      setPendingDeletionId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onSettled: () => {
      setPendingDeletionId(null);
    },
  });

  const handleDelete = (subscription: SubscriptionRecord) => {
    const confirmed = window.confirm(`Delete ${subscription.title}? This action cannot be undone.`);
    if (!confirmed) return;
    deleteSubscription.mutate(subscription.id);
  };

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Subscriptions</h1>
            <p className="mt-2 text-sm text-muted">
              Track all your recurring payments in one place.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search subscriptions..."
              className="glass-input w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="glass-card rounded-2xl p-5 shadow-glass">
            <p className="text-sm text-muted">Monthly Total</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--accent-from)]">
              {formatCurrency(totals.monthly)}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5 shadow-glass">
            <p className="text-sm text-muted">Yearly Total</p>
            <p className="mt-2 text-2xl font-semibold text-rose-400">
              {formatCurrency(totals.yearly)}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5 shadow-glass">
            <p className="text-sm text-muted">Active Subscriptions</p>
            <p className="mt-2 text-2xl font-semibold">
              {subscriptions.length}
            </p>
          </div>
        </section>

        <div className="glass-card rounded-2xl p-5 shadow-glass flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {FILTER_TABS.map(({ label, value }) => {
              const isActive = filter === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-from-rgb),0.4)] ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.35)]'
                      : 'glass-input text-muted'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <label className="flex items-center gap-2 text-sm text-muted">
              Sort
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SubscriptionSort)}
                className="glass-input rounded-xl px-3 py-2 text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {isError && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-300">
            Failed to load subscriptions.{' '}
            {error instanceof Error ? error.message : 'Please try again shortly.'}
          </div>
        )}

        {!isError && (
          <section className="min-h-[240px]">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-muted">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-muted">
                <h2 className="text-xl font-semibold text-primary">No subscriptions yet</h2>
                <p className="mt-2 text-sm">
                  Add your first subscription to track recurring payments.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onDelete={() => handleDelete(subscription)}
                    isDeleting={pendingDeletionId === subscription.id && deleteSubscription.isPending}
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
        aria-label="Add subscription"
      >
        <Plus className="h-8 w-8" />
      </button>

      <AddSubscriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
