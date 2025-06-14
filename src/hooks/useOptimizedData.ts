
import { useMemo, useCallback } from 'react';

interface UseOptimizedDataOptions<T> {
  data: T[];
  sortKey?: keyof T;
  filterFn?: (item: T) => boolean;
  sortDirection?: 'asc' | 'desc';
}

export const useOptimizedData = <T>({
  data,
  sortKey,
  filterFn,
  sortDirection = 'asc'
}: UseOptimizedDataOptions<T>) => {
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filter if provided
    if (filterFn) {
      result = result.filter(filterFn);
    }

    // Apply sort if provided
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return sortDirection === 'asc' ? comparison : -comparison;
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          const comparison = aVal - bVal;
          return sortDirection === 'asc' ? comparison : -comparison;
        }
        
        return 0;
      });
    }

    return result;
  }, [data, sortKey, filterFn, sortDirection]);

  const getItemById = useCallback((id: string | number) => {
    return data.find(item => (item as any).id === id);
  }, [data]);

  const getItemsByProperty = useCallback((property: keyof T, value: any) => {
    return data.filter(item => item[property] === value);
  }, [data]);

  return {
    data: processedData,
    originalData: data,
    count: processedData.length,
    originalCount: data.length,
    getItemById,
    getItemsByProperty
  };
};
