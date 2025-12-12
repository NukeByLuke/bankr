import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import { apiClient } from '@/utils/api';
import { EmptyState } from './EmptyState';
import { BudgetCard } from './BudgetCard';
import { AddBudgetModal } from './AddBudgetModal';

export default function Budgets() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch budgets
  const { data, isLoading, error } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await apiClient.get('/budgets');
      return response.data.data;
    },
  });

  // Add budget mutation
  const addBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const response = await apiClient.post('/budgets', budgetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      console.error('Failed to add budget:', error);
    },
  });

  const handleAddBudget = (data: any) => {
    // Transform frontend form data to match backend API schema
    const budgetData = {
      category: data.categories[0], // Backend expects single category
      amount: data.amount,
      period: data.period === 'DAILY' ? 'WEEKLY' : data.period, // Backend doesn't support DAILY
      startDate: new Date(data.startDate).toISOString(), // Backend expects ISO datetime
      alertAt: 80, // Default alert threshold
    };
    addBudgetMutation.mutate(budgetData);
  };

  // Delete budget mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete budget:', error);
    },
  });

  const handleDeleteBudget = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudgetMutation.mutate(id);
    }
  };

  const budgets = data || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Budgets</h1>
            <p className="text-gray-400">
              Track your spending and savings goals
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 bg-[#0f0f0f]/60 backdrop-blur-md border border-white/10 rounded-xl hover:border-[rgba(var(--accent-from-rgb),0.3)] transition-all duration-200 hover:shadow-[0_0_15px_rgba(var(--accent-from-rgb),0.2)]">
              <Pencil className="w-5 h-5 text-gray-400 hover:text-[var(--accent-from)] transition-colors" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-3 accent-gradient rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(var(--accent-from-rgb),0.25)] hover:shadow-[0_0_25px_rgba(var(--accent-from-rgb),0.35)]"
            >
              <Plus className="w-5 h-5 text-[color-mix(in_srgb,var(--accent-to)_15%,black)]" />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400">Failed to load budgets</p>
            <p className="text-sm text-gray-500 mt-1">
              {error instanceof Error ? error.message : 'Please try again'}
            </p>
          </div>
        )}

        {/* Content */}
        {!error && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-[#0f0f0f]/60 border border-white/5 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 bg-secondary-700 rounded-full" />
                      <div className="flex-1">
                        <div className="h-5 bg-secondary-700 rounded w-2/3 mb-2" />
                        <div className="h-3 bg-secondary-700 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-8 bg-secondary-700 rounded mb-3" />
                    <div className="h-3 bg-secondary-700 rounded-full" />
                  </div>
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget: any, index: number) => (
                  <div
                    key={budget.id}
                    className="animate-[fadeInUp_0.4s_ease-out]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <BudgetCard 
                      budget={budget} 
                      onDelete={handleDeleteBudget}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 accent-gradient rounded-full shadow-[0_0_30px_rgba(var(--accent-from-rgb),0.4)] hover:shadow-[0_0_40px_rgba(var(--accent-from-rgb),0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-40 group"
          aria-label="Add budget"
        >
          <Plus className="w-8 h-8 text-[color-mix(in_srgb,var(--accent-to)_15%,black)] group-hover:rotate-90 transition-transform duration-300" />
          
          {/* Animated glow */}
          <div className="absolute inset-0 rounded-full bg-[rgba(var(--accent-from-rgb),0.6)] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        </button>
      </div>

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBudget}
        isSubmitting={addBudgetMutation.isPending}
      />
    </div>
  );
}
