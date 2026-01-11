import AsyncStorage from "@react-native-async-storage/async-storage";
import { CACHE_EXPIRY_MS, CACHE_INDEX_KEY, CACHE_PREFIX } from "../config/constants";
import { Meal } from "../types/Meal";

type CacheEntry = {
	meal: Meal;
	timestamp: number;
};

type CacheIndex = Record<string, number>;

async function getCacheIndex(): Promise<CacheIndex> {
	try {
		const indexJson = await AsyncStorage.getItem(CACHE_INDEX_KEY);
		return indexJson ? JSON.parse(indexJson) : {};
	} catch (e) {
		console.error("Error getting cache index:", e);
		return {};
	}
}

async function updateCacheIndex(mealId: string, timestamp: number): Promise<void> {
	try {
		const index = await getCacheIndex();
		index[mealId] = timestamp;
		await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
	} catch (e) {
		console.error("Error updating cache index:", e);
	}
}

export async function cacheMeal(meal: Meal): Promise<void> {
	try {
		const entry: CacheEntry = {
			meal,
			timestamp: Date.now(),
		};

		await AsyncStorage.setItem(`${CACHE_PREFIX}${meal.idMeal}`, JSON.stringify(entry));
		await updateCacheIndex(meal.idMeal, entry.timestamp);
	} catch (e) {
		console.error("Error caching meal:", e);
	}
}

export async function getCachedMeal(mealId: string): Promise<Meal | null> {
	try {
		const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${mealId}`);
		if (!cached) return null;

		const entry: CacheEntry = JSON.parse(cached);
		return entry.meal;
	} catch (e) {
		console.error("Error getting cached meal:", e);
		return null;
	}
}

export async function isMealCached(mealId: string): Promise<boolean> {
	try {
		const index = await getCacheIndex();
		return mealId in index;
	} catch (e) {
		console.error("Error checking cache:", e);
		return false;
	}
}

export async function getCachedMealIds(): Promise<string[]> {
	try {
		const index = await getCacheIndex();
		return Object.keys(index);
	} catch (e) {
		console.error("Error getting cached meal IDs:", e);
		return [];
	}
}

export async function clearOldCache(): Promise<void> {
	try {
		const index = await getCacheIndex();
		const now = Date.now();
		const updatedIndex: CacheIndex = {};

		const removePromises: Promise<void>[] = [];

		for (const [mealId, timestamp] of Object.entries(index)) {
			if (now - timestamp < CACHE_EXPIRY_MS) {
				updatedIndex[mealId] = timestamp;
			} else {
				removePromises.push(AsyncStorage.removeItem(`${CACHE_PREFIX}${mealId}`));
			}
		}

		await Promise.all(removePromises);
		await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(updatedIndex));
	} catch (e) {
		console.error("Error clearing old cache:", e);
	}
}
