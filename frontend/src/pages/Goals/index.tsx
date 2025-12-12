import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import GoalCard from './GoalCard';
import AddGoalModal from './AddGoalModal';
import EmptyState from './EmptyState';

export interface Goal {
  id: string;
  name: string;
  type: 'SAVINGS' | 'EXPENSE';
  color?: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Goals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await apiClient.get('/goals');
      return response.data;
    },
  });

  const goals: Goal[] = data?.data || [];

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      await apiClient.delete(`/goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const handleEditGoal = (goalId: string) => {
    setEditingGoalId(goalId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Goals</h1>
          <p className="text-gray-400 mt-2">Track your savings and spending targets</p>
        </div>

        {/* Goals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-[#0f0f0f]/60 backdrop-blur-md border border-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <EmptyState onAddClick={() => setIsModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add Goal Card */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="h-64 bg-[#0f0f0f]/60 backdrop-blur-md border border-white/5 border-dashed rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-[rgba(var(--accent-from-rgb),0.3)] hover:shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.2)] group animate-[fadeInUp_0.4s_ease-out]"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[rgba(var(--accent-from-rgb),0.2)] to-[rgba(var(--accent-to-rgb),0.2)] flex items-center justify-center group-hover:from-[rgba(var(--accent-from-rgb),0.3)] group-hover:to-[rgba(var(--accent-to-rgb),0.3)] transition-all duration-300">
                <Plus className="w-8 h-8 text-[var(--accent-from)]" />
              </div>
              <p className="text-gray-400 font-medium">Add New Goal</p>
            </button>

            {/* Goal Cards */}
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] rounded-full shadow-[0_0_30px_rgba(var(--accent-to-rgb),0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-[0_0_40px_rgba(var(--accent-to-rgb),0.6)] z-40 group"
          aria-label="Add goal"
        >
          <Plus className="w-8 h-8 text-[color-mix(in_srgb,var(--accent-to)_15%,black)] group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingGoalId(null); }} />
    </div>
  );
}
