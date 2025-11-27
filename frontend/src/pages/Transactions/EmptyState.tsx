import React from 'react';
import { Calendar } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        {/* Animated mint glow */}
        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-[var(--accent-from)]/20 blur-3xl" />
        
        {/* Icon container */}
        <div className="glass-card relative rounded-3xl p-8">
          <Calendar className="h-16 w-16 text-[var(--accent-from)]" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="mb-2 text-xl font-semibold text-primary">
        No transactions yet
      </h3>
      <p className="mb-6 max-w-md text-center text-muted">
        Start tracking your finances by adding your first transaction
      </p>

      <div className="flex items-center gap-2 text-sm text-muted">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-from)]" />
        <span>Click the + button below to get started</span>
      </div>
    </div>
  );
};
