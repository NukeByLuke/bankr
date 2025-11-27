import { create } from 'zustand';

export type TransactionSort = 'Most Recent' | 'Oldest' | 'Highest Amount' | 'Lowest Amount';

export interface TransactionFilterState {
  sortBy: TransactionSort;
  category: string;
  searchQuery: string;
  setSortBy: (sort: TransactionSort) => void;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const ALL_CATEGORIES = 'ALL';

export const useTransactionFilters = create<TransactionFilterState>((set) => ({
  sortBy: 'Most Recent',
  category: ALL_CATEGORIES,
  searchQuery: '',
  setSortBy: (sortBy) => set({ sortBy }),
  setCategory: (category) => set({ category }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  reset: () => set({ sortBy: 'Most Recent', category: ALL_CATEGORIES, searchQuery: '' }),
}));
