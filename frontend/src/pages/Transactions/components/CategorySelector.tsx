import { ShoppingCart, Home, Car, Utensils, Heart, Plane, Gift, Smartphone, GraduationCap, Briefcase, DollarSign, Zap } from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  type: 'INCOME' | 'EXPENSE';
}

const expenseCategories = [
  { value: 'FOOD', label: 'Food', icon: Utensils },
  { value: 'TRANSPORT', label: 'Transport', icon: Car },
  { value: 'SHOPPING', label: 'Shopping', icon: ShoppingCart },
  { value: 'HOUSING', label: 'Housing', icon: Home },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: Smartphone },
  { value: 'HEALTHCARE', label: 'Healthcare', icon: Heart },
  { value: 'EDUCATION', label: 'Education', icon: GraduationCap },
  { value: 'TRAVEL', label: 'Travel', icon: Plane },
  { value: 'GIFTS', label: 'Gifts', icon: Gift },
  { value: 'UTILITIES', label: 'Utilities', icon: Zap },
  { value: 'OTHER', label: 'Other', icon: DollarSign },
];

const incomeCategories = [
  { value: 'SALARY', label: 'Salary', icon: Briefcase },
  { value: 'BUSINESS', label: 'Business', icon: DollarSign },
  { value: 'INVESTMENTS', label: 'Investments', icon: TrendingUp },
  { value: 'FREELANCE', label: 'Freelance', icon: Briefcase },
  { value: 'GIFTS', label: 'Gifts', icon: Gift },
  { value: 'OTHER', label: 'Other Income', icon: DollarSign },
];

export default function CategorySelector({ value, onChange, type }: CategorySelectorProps) {
  const categories = type === 'INCOME' ? incomeCategories : expenseCategories;

  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-muted">Category</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = value === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onChange(category.value)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300
                ${isActive
                  ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] border-transparent text-[color-mix(in_srgb,var(--accent-to)_15%,black)] font-semibold shadow-[0_0_15px_rgba(var(--accent-to-rgb),0.3)]'
                  : 'glass-input text-muted hover:shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.18)]'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[color-mix(in_srgb,var(--accent-to)_10%,black)]' : 'text-muted'}`} />
              <span className="text-xs text-center">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
