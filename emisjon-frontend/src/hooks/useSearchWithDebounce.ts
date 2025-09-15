import { useState, useEffect, useCallback } from 'react';

export function useSearchWithDebounce(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  const updateSearchTerm = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, delay]);

  return {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    setSearchTerm
  };
}