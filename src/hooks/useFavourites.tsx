import { useCallback, useEffect, useState } from 'react';
import { getFavourites } from '../services/favouritesService';
import { Meal } from '../types/Meal';

export function useFavourites(shouldLoad: boolean = true) {
  const [favourites, setFavourites] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const meals = await getFavourites();
      setFavourites(meals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shouldLoad) {
      load();
    }
  }, [shouldLoad, load]);

  return { favourites, loading, reload: load };
}
