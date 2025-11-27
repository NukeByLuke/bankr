import { useMemo, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Target,
  Sparkles,
} from 'lucide-react';
import { differenceInCalendarDays, format } from 'date-fns';
import { apiClient } from '../utils/api';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number | string;
  description: string;
  date: string;
  merchant?: string;
  transactionType?: string;
  notes?: string;
  isRecurring?: boolean;
}

interface TransactionSummary {
  totalIncome: number | string | null;
  totalExpenses: number | string | null;
  balance: number | string | null;
}

interface BudgetSummary {
  id: string;
  name: string;
  amount: number;
  spent: number;
  color: string;
  type: 'EXPENSE' | 'SAVINGS';
}

interface GoalSummary {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  endDate?: string | null;
}

const widgetCardStyles =
  'glass-card rounded-2xl border border-subtle p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(var(--accent-from-rgb),0.35)]';

const statCardStyles =
  'rounded-2xl border border-subtle bg-[var(--color-card)]/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_22px_rgba(var(--accent-from-rgb),0.25)]';

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

interface AccountRowProps {
  label: string;
  amount: number;
  icon: ElementType;
  accent: string;
  subtitle: string;
}

const AccountRow = ({ label, amount, icon: Icon, accent, subtitle }: AccountRowProps) => (
  <div className="flex items-center justify-between rounded-xl border border-subtle/80 bg-black/5 px-3 py-3 text-sm transition-all duration-300 hover:border-[rgba(var(--accent-from-rgb),0.4)] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-primary shadow-[0_10px_24px_rgba(0,0,0,0.12)] ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-primary">{label}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
    <span className="text-sm font-semibold text-primary">{formatCurrency(amount)}</span>
  </div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
    <div
      style={{ width: `${Math.min(progress, 100)}%` }}
  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] transition-all duration-500"
    />
  </div>
);

export default function Home() {
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['transactions', 'summary'],
    queryFn: async () => {
      const response = await apiClient.get('/transactions/stats/summary');
      return response.data.data as TransactionSummary;
    },
  });

  const { data: recentTransactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: async () => {
      const response = await apiClient.get('/transactions?limit=10');
      return response.data.data as Transaction[];
    },
  });

  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await apiClient.get('/budgets');
      return response.data.data as BudgetSummary[];
    },
  });

  const { data: goalsPayload, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', 'overview'],
    queryFn: async () => {
      const response = await apiClient.get('/goals');
      return response.data.data as GoalSummary[];
    },
  });

  const stats = useMemo(() => ({
    totalIncome: toNumber(summaryData?.totalIncome),
    totalExpenses: toNumber(summaryData?.totalExpenses),
    totalBalance: toNumber(summaryData?.balance),
    totalSavings:
      toNumber(summaryData?.totalIncome) - toNumber(summaryData?.totalExpenses),
  }), [summaryData]);

  const recentTransactions = useMemo(
    () => (recentTransactionsData || []).slice(0, 5),
    [recentTransactionsData]
  );

  const accountBreakdown = useMemo(() => {
    const investmentFlow = (recentTransactionsData || [])
      .filter((tx) => tx.category?.toUpperCase().includes('INVEST'))
      .reduce((acc, tx) => acc + toNumber(tx.amount), 0);

    const cashFlow = (recentTransactionsData || [])
      .filter((tx) => tx.category?.toUpperCase().includes('CASH'))
      .reduce((acc, tx) => acc + toNumber(tx.amount), 0);

    const bankBalance = Math.max(stats.totalBalance - investmentFlow * 0.25, 0);
    const cashReserve = Math.max(cashFlow || stats.totalExpenses * 0.12, 0);
    const investmentBalance = Math.max(investmentFlow || stats.totalSavings * 0.4, 0);

    const accentClasses = 'bg-[rgba(var(--accent-from-rgb),0.15)] text-[var(--accent-from)]';

    return [
      {
        label: 'Bank',
        amount: bankBalance,
        icon: Wallet,
        accent: accentClasses,
        subtitle: 'Spending & deposits',
      },
      {
        label: 'Cash',
        amount: cashReserve,
        icon: Coins,
        accent: 'bg-sky-500/15 text-sky-400',
        subtitle: 'On-hand for daily use',
      },
      {
        label: 'Investments',
        amount: investmentBalance,
        icon: PiggyBank,
        accent: 'bg-amber-500/15 text-amber-400',
        subtitle: 'Long-term growth',
      },
    ];
  }, [recentTransactionsData, stats.totalBalance, stats.totalExpenses, stats.totalSavings]);

  const topBudgets = useMemo(() => {
    if (!budgetsData) return [];
    return budgetsData.slice(0, 3).map((budget) => {
      const amount = toNumber(budget.amount);
      const spent = toNumber(budget.spent);
      const progress = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;

      return {
        id: budget.id,
        name: budget.name,
        amount,
        spent,
        color: budget.color,
        type: budget.type,
        progress,
      };
    });
  }, [budgetsData]);

  const activeGoals = useMemo(() => {
    if (!goalsPayload) return [];
    return goalsPayload.slice(0, 3).map((goal) => {
      const targetAmount = toNumber(goal.targetAmount);
      const currentAmount = toNumber(goal.currentAmount);
      const progress = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

      return {
        id: goal.id,
        name: goal.name,
        targetAmount,
        currentAmount,
        endDate: goal.endDate,
        progress,
      };
    });
  }, [goalsPayload]);

  const upcomingPayments = useMemo(() => {
    const now = new Date();
    return (recentTransactionsData || [])
      .filter((tx) => {
        const dueDate = new Date(tx.date);
        const isFuture = dueDate > now;
        const flaggedType = (tx.transactionType || '').toLowerCase();
        const isRecurring = Boolean(tx.isRecurring);
        const looksRecurring =
          isRecurring || ['subscription', 'repetitive', 'upcoming'].includes(flaggedType);
        return isFuture || looksRecurring;
      })
      .slice(0, 5);
  }, [recentTransactionsData]);

  const loadingWidgets = summaryLoading || transactionsLoading;

  return (
    <div className="space-y-8">
      <section className="glass-card relative overflow-hidden rounded-3xl border border-subtle p-6 md:p-8 transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--accent-to-rgb),0.25)]">
        <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-gradient-to-br from-[rgba(var(--accent-from-rgb),0.3)] to-[rgba(var(--accent-to-rgb),0.2)] blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-primary md:text-4xl">
              Welcome back to Bankr
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted">
              Track accounts, budgets, and goals in one calm, glassy dashboard. Everything stays in sync with your light and dark preferences.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-2xl border border-subtle/70 bg-black/5 p-4 text-sm uppercase tracking-wide text-muted dark:bg-white/5">
            <span className="text-xs">Net Balance</span>
            <span className="text-2xl font-semibold text-primary">
              {loadingWidgets ? '—' : formatCurrency(stats.totalBalance)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-from)]">
              <ArrowUpRight className="h-3 w-3" />
              {loadingWidgets ? 'Syncing' : 'Updated just now'}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={statCardStyles}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Total Balance</p>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {loadingWidgets ? '—' : formatCurrency(stats.totalBalance)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_20%,black)] shadow-[0_12px_28px_rgba(var(--accent-to-rgb),0.35)]">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className={statCardStyles}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Monthly Income</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--accent-from)]">
                {loadingWidgets ? '—' : formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(var(--accent-from-rgb),0.15)] text-[var(--accent-from)]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className={statCardStyles}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Monthly Expenses</p>
              <p className="mt-2 text-2xl font-semibold text-rose-500">
                {loadingWidgets ? '—' : formatCurrency(stats.totalExpenses)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className={statCardStyles}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Net Savings</p>
              <p className="mt-2 text-2xl font-semibold text-sky-500">
                {loadingWidgets ? '—' : formatCurrency(stats.totalSavings)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article className={`${widgetCardStyles} flex flex-col gap-4`}>
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Accounts</h2>
              <p className="text-xs text-muted">Bank, cash, and investment snapshots</p>
            </div>
            <span className="rounded-full border border-subtle px-3 py-1 text-xs text-muted">
              {loadingWidgets ? '—' : '3 total'}
            </span>
          </header>
          <div className="flex flex-col gap-3">
            {accountBreakdown.map((account) => (
              <AccountRow key={account.label} {...account} />
            ))}
          </div>
        </article>

        <article className={`${widgetCardStyles} flex flex-col gap-5`}>
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Budgets overview</h2>
              <p className="text-xs text-muted">Track spend against targets</p>
            </div>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-to)] hover:opacity-80"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </header>

          <div className="flex flex-col gap-4">
            {budgetsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 rounded-xl bg-black/10 dark:bg-white/10 animate-pulse" />
                ))}
              </div>
            )}

            {!budgetsLoading && topBudgets.length === 0 && (
              <p className="text-sm text-muted">You haven’t created budgets yet. Set one up to start tracking.</p>
            )}

            {!budgetsLoading &&
              topBudgets.map((budget) => (
                <div key={budget.id} className="rounded-xl border border-subtle/80 bg-black/5 p-3 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">{budget.name}</p>
                      <p className="text-xs text-muted">
                        {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)} used
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-muted">{budget.progress.toFixed(0)}%</span>
                  </div>
                  <ProgressBar progress={budget.progress} />
                </div>
              ))}
          </div>
        </article>

        <article className={`${widgetCardStyles} flex flex-col gap-5`}>
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Goals progress</h2>
              <p className="text-xs text-muted">Stay on track toward milestones</p>
            </div>
            <Link
              to="/goals"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-to)] hover:opacity-80"
            >
              Manage
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </header>

          <div className="flex flex-col gap-4">
            {goalsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-20 rounded-xl bg-black/10 dark:bg-white/10 animate-pulse" />
                ))}
              </div>
            )}

            {!goalsLoading && activeGoals.length === 0 && (
              <p className="text-sm text-muted">No active goals yet. Create one to start tracking progress.</p>
            )}

            {!goalsLoading &&
              activeGoals.map((goal) => (
                <div key={goal.id} className="rounded-xl border border-subtle/80 bg-black/5 p-3 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">{goal.name}</p>
                      <p className="text-xs text-muted">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1 text-[10px] uppercase tracking-wide text-muted dark:bg-white/10">
                      <Target className="h-3 w-3" />
                      {goal.progress.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar progress={goal.progress} />
                  {goal.endDate && (
                    <p className="mt-2 text-xs text-muted">
                      Target date · {format(new Date(goal.endDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </article>

        <article className={`${widgetCardStyles} flex flex-col gap-4 xl:col-span-2`}>
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Recent transactions</h2>
              <p className="text-xs text-muted">Latest activity from all accounts</p>
            </div>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-to)] hover:opacity-80"
            >
              View all
              <ArrowRight className="hidden h-3 w-3 md:inline" />
            </Link>
          </header>

          <div className="relative max-h-72 space-y-2 overflow-y-auto pr-1">
            {transactionsLoading && (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-16 rounded-xl bg-black/10 dark:bg-white/10 animate-pulse" />
                ))}
              </div>
            )}

            {!transactionsLoading && recentTransactions.length === 0 && (
              <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-subtle text-center text-sm text-muted">
                <Sparkles className="mb-2 h-5 w-5 opacity-60" />
                Add your first transaction to populate this feed.
              </div>
            )}

            {!transactionsLoading &&
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="group flex items-center justify-between rounded-2xl border border-transparent bg-black/5 px-3 py-3 text-sm transition-all duration-300 hover:border-[rgba(var(--accent-from-rgb),0.3)] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">{transaction.description}</p>
                    <p className="text-xs text-muted">
                      {format(new Date(transaction.date), 'EEE, MMM dd · p')}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-[var(--accent-from)]'
                        : 'text-rose-400'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(toNumber(transaction.amount))}
                  </span>
                </div>
              ))}
          </div>
        </article>

        <article className={`${widgetCardStyles} flex flex-col gap-5`}>
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Upcoming payments</h2>
              <p className="text-xs text-muted">Recurring bills & subscriptions</p>
            </div>
            <Link
              to="/scheduled-payments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-to)] hover:opacity-80"
            >
              Manage
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </header>

          <div className="space-y-3">
            {upcomingPayments.length === 0 ? (
              <p className="text-sm text-muted">
                Nothing due in the next few days. New recurring entries will appear automatically.
              </p>
            ) : (
              upcomingPayments.map((transaction) => {
                const daysRemaining = Math.max(
                  differenceInCalendarDays(new Date(transaction.date), new Date()),
                  0
                );
                return (
                  <div
                    key={`${transaction.id}-upcoming`}
                    className="flex items-center justify-between rounded-xl border border-subtle/80 bg-black/5 px-3 py-3 text-sm transition-all duration-300 hover:border-[rgba(var(--accent-from-rgb),0.35)] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div>
                      <p className="font-semibold text-primary">{transaction.description}</p>
                      <p className="text-xs text-muted">
                        Due {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-rose-400">
                        {formatCurrency(Math.abs(toNumber(transaction.amount)))}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted">
                        {daysRemaining === 0 ? 'Due today' : `${daysRemaining} days`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
