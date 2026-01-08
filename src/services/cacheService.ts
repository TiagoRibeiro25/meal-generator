import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal } from '../types/Meal';

const CACHE_PREFIX = '@meal_cache_';
const CACHE_INDEX_KEY = '@meal_cache_index';

type CacheEntry = {
  meal: Meal;
  timestamp: number;
};

type CacheIndex = {
  [mealId: string]: number; // mealId -> timestamp
};

export async function cacheMeal(meal: Meal): Promise<void> {
  try {
    const entry: CacheEntry = {
      meal,
      timestamp: Date.now(),
    };
    
    // Save the meal
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${meal.idMeal}`,
      JSON.stringify(entry)
    );
    
    // Update the index
    const index = await getCacheIndex();
    index[meal.idMeal] = entry.timestamp;
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.error('Error caching meal:', e);
  }
}

export async function getCachedMeal(mealId: string): Promise<Meal | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${mealId}`);
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    return entry.meal;
  } catch (e) {
    console.error('Error getting cached meal:', e);
    return null;
  }
}

export async function isMealCached(mealId: string): Promise<boolean> {
  try {
    const index = await getCacheIndex();
    return mealId in index;
  } catch (e) {
    console.error('Error checking cache:', e);
    return false;
  }
}

export async function getCachedMealIds(): Promise<string[]> {
  try {
    const index = await getCacheIndex();
    return Object.keys(index);
  } catch (e) {
    console.error('Error getting cached meal IDs:', e);
    return [];
  }
}

async function getCacheIndex(): Promise<CacheIndex> {
  try {
    const indexJson = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    return indexJson ? JSON.parse(indexJson) : {};
  } catch (e) {
    console.error('Error getting cache index:', e);
    return {};
  }
}

// Clear old cache entries (older than 30 days)
export async function clearOldCache(): Promise<void> {
  try {
    const index = await getCacheIndex();
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    
    const updatedIndex: CacheIndex = {};
    
    for (const [mealId, timestamp] of Object.entries(index)) {
      if (now - timestamp < thirtyDaysInMs) {
        updatedIndex[mealId] = timestamp;
      } else {
        // Remove old entry
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${mealId}`);
      }
    }
    
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(updatedIndex));
  } catch (e) {
    console.error('Error clearing old cache:', e);
  }
}
