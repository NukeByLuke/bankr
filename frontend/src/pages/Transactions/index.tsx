import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { apiClient } from '@/utils/api';
import { EmptyState } from './EmptyState';
import { TransactionList } from './TransactionList';
import AddTransaction from './AddTransaction';
import {
  useTransactionFilters,
  ALL_CATEGORIES,
  TransactionSort,
} from '@/store/transactionFilters';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SORT_OPTIONS: TransactionSort[] = [
  'Most Recent',
  'Oldest',
  'Highest Amount',
  'Lowest Amount',
];

const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: ALL_CATEGORIES, label: 'All Categories' },
  { value: 'FOOD', label: 'Groceries & Dining' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'HOUSING', label: 'Housing & Rent' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'UTILITIES', label: 'Bills & Utilities' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'INVESTMENT', label: 'Investments' },
  { value: 'SALARY', label: 'Salary' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'GIFTS', label: 'Gifts' },
  { value: 'OTHER', label: 'Other' },
];

interface TransactionItem {
  id: string;
  title?: string;
  description?: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes?: string;
}

const normalizeAmount = (amount: number | string): number => {
  if (typeof amount === 'number') return amount;
  const parsed = parseFloat(amount);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export default function Transactions() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    sortBy,
    category,
    searchQuery,
    setCategory,
    setSearchQuery,
    setSortBy,
  } = useTransactionFilters();

  const { data, isLoading, error } = useQuery<TransactionItem[]>({
    queryKey: ['transactions', selectedMonth, selectedYear],
    queryFn: async () => {
      const monthName = months[selectedMonth];
      const response = await apiClient.get(
        `/transactions?month=${monthName}&year=${selectedYear}`
      );
      return response.data.data as TransactionItem[];
    },
  });

  const transactions = data || [];

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = transactions
      .filter((transaction) => {
        if (category === ALL_CATEGORIES) return true;
        return transaction.category === category;
      })
      .filter((transaction) => {
        if (!normalizedSearch) return true;
        const haystack = `${transaction.description ?? ''} ${transaction.notes ?? ''} ${transaction.title ?? ''}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });

    return filtered.sort((a, b) => {
      const amountA = normalizeAmount(a.amount);
      const amountB = normalizeAmount(b.amount);
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      switch (sortBy) {
        case 'Oldest':
          return dateA - dateB;
        case 'Highest Amount':
          return amountB - amountA;
        case 'Lowest Amount':
          return amountA - amountB;
        case 'Most Recent':
        default:
          return dateB - dateA;
      }
    });
  }, [transactions, category, searchQuery, sortBy]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        const amount = normalizeAmount(transaction.amount);
        if (transaction.type === 'INCOME') {
          acc.income += amount;
        } else {
          acc.expense += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const initialTransactionDate = useMemo(() => {
    const today = new Date();
    if (today.getFullYear() === selectedYear && today.getMonth() === selectedMonth) {
      return today;
    }
    return new Date(selectedYear, selectedMonth + 1, 0);
  }, [selectedMonth, selectedYear]);

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((year) => year - 1);
    } else {
      setSelectedMonth((month) => month - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((year) => year + 1);
    } else {
      setSelectedMonth((month) => month + 1);
    }
  };

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl glass-input hover-glow"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center md:text-left">
              <h1 className="mb-1 text-3xl font-semibold transition-colors duration-300">
                {months[selectedMonth]}
              </h1>
              <p className="text-sm text-muted">{selectedYear}</p>
            </div>

            <button
              onClick={handleNextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl glass-input hover-glow"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="glass-card rounded-2xl px-5 py-4 shadow-glass">
            <p className="text-sm text-muted">Net flow this month</p>
            <p className={`mt-1 text-2xl font-semibold ${summary.income - summary.expense >= 0 ? 'text-[var(--accent-from)]' : 'text-rose-500'}`}>
              {formatCurrency(summary.income - summary.expense)}
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass-card rounded-2xl p-4 shadow-glass">
            <p className="text-sm text-muted">Income</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--accent-from)]">
              {formatCurrency(summary.income)}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-4 shadow-glass">
            <p className="text-sm text-muted">Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-rose-500">
              {formatCurrency(summary.expense)}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-4 shadow-glass">
            <p className="text-sm text-muted">Transactions</p>
            <p className="mt-2 text-2xl font-semibold">
              {transactions.length}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-4 shadow-glass">
            <p className="text-sm text-muted">Search Active</p>
            <p className="mt-2 text-lg font-medium">
              {searchQuery ? `“${searchQuery}”` : '—'}
            </p>
          </div>
        </section>

  <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 hover:shadow-[0_0_20px_rgba(var(--accent-from-rgb),0.25)] transition-shadow duration-300">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-44">
              <label className="label mb-2">Sort</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as TransactionSort)}
                className="glass-input w-full appearance-none text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="label mb-2">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="glass-input w-full appearance-none text-sm"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search transactions..."
              className="glass-input w-full pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-center text-rose-400">
            <p>Failed to load transactions</p>
            <p className="text-sm text-muted mt-1">
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        )}

        {!error && (
          <>
            {isLoading ? (
              <TransactionList transactions={[]} isLoading={true} />
            ) : filteredTransactions.length === 0 ? (
              <EmptyState />
            ) : (
              <TransactionList transactions={filteredTransactions} />
            )}
          </>
        )}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
  className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full accent-gradient text-black shadow-[0_0_30px_rgba(var(--accent-from-rgb),0.45)] transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Add transaction"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AddTransaction
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={initialTransactionDate}
      />
    </div>
  );
}
