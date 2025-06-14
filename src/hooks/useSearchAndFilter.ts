
import { useState, useMemo } from 'react';

interface UseSearchAndFilterOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  filterFn?: (item: T, query: string) => boolean;
}

export const useSearchAndFilter = <T>({
  items,
  searchFields,
  filterFn
}: UseSearchAndFilterOptions<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();

    if (filterFn) {
      return items.filter(item => filterFn(item, query));
    }

    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      })
    );
  }, [items, searchQuery, searchFields, filterFn]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    hasResults: filteredItems.length > 0,
    totalItems: items.length,
    filteredCount: filteredItems.length
  };
};
