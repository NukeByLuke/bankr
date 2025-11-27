import { Target } from 'lucide-react';

interface EmptyStateProps {
  onAddClick: () => void;
}

export default function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-[fadeInUp_0.4s_ease-out]">
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[rgba(var(--accent-from-rgb),0.2)] to-[rgba(var(--accent-to-rgb),0.2)] flex items-center justify-center mb-6 animate-[scale-in_0.5s_ease-out]">
        <Target className="w-12 h-12 text-[var(--accent-from)]" />
      </div>
      <h3 className="text-xl font-semibold text-gray-100 mb-2">No Goals Yet</h3>
      <p className="text-gray-400 text-center max-w-md mb-8">
        Start tracking your financial goals to visualize your progress and stay motivated
      </p>
      <button
        onClick={onAddClick}
  className="px-6 py-3 bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] font-semibold rounded-xl shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent-to-rgb),0.4)] transition-all duration-300"
      >
        Create Your First Goal
      </button>
    </div>
  );
}
