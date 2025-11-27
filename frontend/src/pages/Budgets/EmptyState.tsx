import React from 'react';
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative mb-8">
        {/* Animated mint glow */}
  <div className="absolute inset-0 bg-[rgba(var(--accent-from-rgb),0.2)] blur-3xl rounded-full animate-pulse" />
        
        {/* Icon container with gradient */}
        <div className="relative bg-gradient-to-br from-[#0f0f0f] to-secondary-900 p-10 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(var(--accent-from-rgb),0.15)]">
          <Wallet className="w-24 h-24 text-[var(--accent-from)]" strokeWidth={1.5} />
          
          {/* Floating accent icons */}
          <div className="absolute -top-2 -right-2 bg-[rgba(var(--accent-from-rgb),0.18)] p-2 rounded-full animate-bounce">
            <TrendingUp className="w-5 h-5 text-[var(--accent-from)]" />
          </div>
          <div className="absolute -bottom-2 -left-2 bg-red-500/20 p-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-white mb-3">
        No active budgets yet
      </h3>
      <p className="text-gray-400 text-center max-w-md mb-8">
        Start tracking your financial goals by creating your first budget
      </p>

      <div className="flex items-center gap-2 text-sm text-gray-500">
  <div className="w-2 h-2 bg-[var(--accent-from)] rounded-full animate-pulse" />
        <span>Click the + button to get started</span>
      </div>
    </div>
  );
};
