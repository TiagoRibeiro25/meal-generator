import { useCallback, useEffect, useState } from 'react';
import { fetchCategories } from '../services/mealService';

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, error, reload: load };
}
