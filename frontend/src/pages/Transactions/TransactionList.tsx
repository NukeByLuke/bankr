import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { TransactionCard } from './TransactionCard';

interface Transaction {
  id: string;
  title?: string;
  description?: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
}) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'summary'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-black/10 dark:bg-white/10" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-1/3 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-3 w-1/4 rounded bg-black/10 dark:bg-white/10" />
              </div>
              <div className="h-5 w-20 rounded bg-black/10 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="relative space-y-6 overflow-visible pb-10">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
        <div key={date} className="space-y-3">
          {/* Date header */}
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-muted">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[rgba(var(--accent-from-rgb),0.35)] to-transparent" />
          </div>

          {/* Transactions for this day */}
          <div className="relative z-0 flex flex-col gap-4 md:gap-5 overflow-visible">
            {dayTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TransactionCard
                  transaction={{
                    ...transaction,
                    title: transaction.description || transaction.title || 'Untitled',
                  }}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
