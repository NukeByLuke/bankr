import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2 } from 'lucide-react';
import { apiClient } from '@/utils/api';
import AddLoanModal from './AddLoanModal.tsx';
import LoanCard, { LoanRecord } from './LoanCard.tsx';

const FILTER_TABS = [
  { label: 'All', value: 'all' as const },
  { label: 'Lent', value: 'lent' as const },
  { label: 'Borrowed', value: 'borrowed' as const },
];

const SORT_OPTIONS = [
  'Most Recent',
  'Oldest',
  'Highest Amount',
  'Lowest Amount',
  'Type A-Z',
] as const;

type LoanFilter = (typeof FILTER_TABS)[number]['value'];
type LoanSort = (typeof SORT_OPTIONS)[number];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

export default function Loans() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<LoanFilter>('all');
  const [sortBy, setSortBy] = useState<LoanSort>('Most Recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<LoanRecord[]>({
    queryKey: ['loans'],
    queryFn: async () => {
      const response = await apiClient.get('/loans');
      return response.data as LoanRecord[];
    },
  });

  const loans = data ?? [];

  const totals = useMemo(() => {
    return loans.reduce(
      (acc, loan) => {
        if (loan.type === 'lent') {
          acc.lent += loan.amount;
        }
        if (loan.type === 'borrowed') {
          acc.borrowed += loan.amount;
        }
        acc.total += loan.amount;
        return acc;
      },
      { lent: 0, borrowed: 0, total: 0 }
    );
  }, [loans]);

  const filteredLoans = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = loans.filter((loan) => {
      if (filter === 'lent' && loan.type !== 'lent') {
        return false;
      }
      if (filter === 'borrowed' && loan.type !== 'borrowed') {
        return false;
      }
      if (!normalizedSearch) return true;
      const haystack = `${loan.name} ${loan.notes ?? ''}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'Highest Amount':
          return b.amount - a.amount;
        case 'Lowest Amount':
          return a.amount - b.amount;
        case 'Type A-Z':
          return a.type.localeCompare(b.type);
        case 'Most Recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [filter, loans, searchTerm, sortBy]);

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/loans/${id}`);
    },
    onMutate: (id) => {
      setPendingDeletionId(id);
    },
    onError: () => {
      setPendingDeletionId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onSettled: () => {
      setPendingDeletionId(null);
    },
  });

  const handleDelete = (loan: LoanRecord) => {
    const confirmed = window.confirm(`Delete ${loan.name}? This action cannot be undone.`);
    if (!confirmed) return;
    deleteLoan.mutate(loan.id);
  };

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Loans</h1>
            <p className="mt-2 text-sm text-muted">
              Track what you owe and what others owe you with fast, polished controls.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search loans..."
              className="glass-input w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="glass-card rounded-2xl p-5 shadow-glass">
            <p className="text-sm text-muted">Total Managed</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.total)}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 shadow-glass">
            <p className="text-sm text-muted">Lent Outstanding</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--accent-from)]">
              {formatCurrency(totals.lent)}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5 shadow-glass">
            <p className="text-sm text-muted">Borrowed Outstanding</p>
            <p className="mt-2 text-2xl font-semibold text-rose-400">
              {formatCurrency(totals.borrowed)}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5 shadow-glass">
            <p className="text-sm text-muted">Active Loans</p>
            <p className="mt-2 text-2xl font-semibold">{loans.length}</p>
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
                onChange={(event) => setSortBy(event.target.value as LoanSort)}
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
            Failed to load loans.{' '}
            {error instanceof Error ? error.message : 'Please try again shortly.'}
          </div>
        )}

        {!isError && (
          <section className="min-h-[240px]">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-muted">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-muted">
                <h2 className="text-xl font-semibold text-primary">No loans yet</h2>
                <p className="mt-2 text-sm">
                  Add your first loan to keep perfect track of lending and borrowing history.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredLoans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    onDelete={() => handleDelete(loan)}
                    isDeleting={pendingDeletionId === loan.id && deleteLoan.isPending}
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
        aria-label="Add loan"
      >
        <Plus className="h-8 w-8" />
      </button>

      <AddLoanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
