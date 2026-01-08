import { useEffect, useState } from 'react';
import { fetchMealsByCategory } from '../services/mealService';
import { Meal } from '../types/Meal';

export function useMealsByCategory(category: string | null) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      setMeals([]);
      setError(null);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const fetchedMeals = await fetchMealsByCategory(category!);
        setMeals(fetchedMeals);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Failed to load meals');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category]);

  return { meals, loading, error };
}
