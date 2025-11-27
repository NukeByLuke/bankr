import React from 'react';
import { Check } from 'lucide-react';

interface BudgetTypeSelectorProps {
  selectedType: 'ADDED_ONLY' | 'ALL_TRANSACTIONS';
  onTypeSelect: (type: 'ADDED_ONLY' | 'ALL_TRANSACTIONS') => void;
}

export const BudgetTypeSelector: React.FC<BudgetTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
}) => {
  return (
    <div className="space-y-3">
      <label className="label">Transaction Tracking</label>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Added Only */}
        <button
          type="button"
          onClick={() => onTypeSelect('ADDED_ONLY')}
          className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
            selectedType === 'ADDED_ONLY'
              ? 'border-[var(--accent-from)] bg-[rgba(var(--accent-from-rgb),0.12)] shadow-[0_0_20px_rgba(var(--accent-from-rgb),0.25)]'
              : 'border-white/10 bg-[#0f0f0f]/60 hover:border-white/20'
          }`}
        >
          {selectedType === 'ADDED_ONLY' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--accent-from)] rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-black" strokeWidth={3} />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[rgba(var(--accent-from-rgb),0.15)] rounded-lg flex items-center justify-center">
                <span className="text-lg">✏️</span>
              </div>
              <h4 className="font-semibold text-white">Added Only</h4>
            </div>
            <p className="text-sm text-gray-400">
              Track only manually added transactions
            </p>
          </div>
        </button>

        {/* All Transactions */}
        <button
          type="button"
          onClick={() => onTypeSelect('ALL_TRANSACTIONS')}
          className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
            selectedType === 'ALL_TRANSACTIONS'
              ? 'border-[var(--accent-from)] bg-[rgba(var(--accent-from-rgb),0.12)] shadow-[0_0_20px_rgba(var(--accent-from-rgb),0.25)]'
              : 'border-white/10 bg-[#0f0f0f]/60 hover:border-white/20'
          }`}
        >
          {selectedType === 'ALL_TRANSACTIONS' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--accent-from)] rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-black" strokeWidth={3} />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🔄</span>
              </div>
              <h4 className="font-semibold text-white">All Transactions</h4>
            </div>
            <p className="text-sm text-gray-400">
              Include all transactions automatically
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
