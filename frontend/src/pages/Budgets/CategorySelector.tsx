import React from 'react';
import {
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Heart,
  Zap,
  Gift,
  Plane,
  Smartphone,
  GraduationCap,
  Coffee,
  Shirt,
} from 'lucide-react';

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

const categories = [
  { id: 'FOOD', icon: Utensils, label: 'Food' },
  { id: 'SHOPPING', icon: ShoppingBag, label: 'Shopping' },
  { id: 'HOUSING', icon: Home, label: 'Housing' },
  { id: 'TRANSPORTATION', icon: Car, label: 'Transport' },
  { id: 'UTILITIES', icon: Zap, label: 'Utilities' },
  { id: 'HEALTHCARE', icon: Heart, label: 'Health' },
  { id: 'ENTERTAINMENT', icon: Gift, label: 'Fun' },
  { id: 'TRAVEL', icon: Plane, label: 'Travel' },
  { id: 'TECHNOLOGY', icon: Smartphone, label: 'Tech' },
  { id: 'EDUCATION', icon: GraduationCap, label: 'Education' },
  { id: 'LIFESTYLE', icon: Coffee, label: 'Lifestyle' },
  { id: 'CLOTHING', icon: Shirt, label: 'Clothing' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onCategoriesChange,
}) => {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const selectAll = () => {
    onCategoriesChange(categories.map((c) => c.id));
  };

  const clearAll = () => {
    onCategoriesChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="label">Categories to Include</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-[var(--accent-from)] hover:text-[color-mix(in_srgb,var(--accent-from)_80%,white)] transition-colors"
          >
            Select All
          </button>
          <span className="text-gray-600">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {categories.map(({ id, icon: Icon, label }) => {
          const isSelected = selectedCategories.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleCategory(id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-[var(--accent-from)] bg-[rgba(var(--accent-from-rgb),0.12)] shadow-[0_0_15px_rgba(var(--accent-from-rgb),0.2)]'
                  : 'border-white/10 bg-[#0f0f0f]/60 hover:border-white/20'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-[rgba(var(--accent-from-rgb),0.15)] text-[var(--accent-from)]'
                    : 'bg-secondary-800 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCategories.length > 0 && (
        <p className="text-sm text-gray-500">
          {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
        </p>
      )}
    </div>
  );
};
