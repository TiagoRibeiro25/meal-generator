import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAX_RECENT, RECENT_KEY } from "../config/recentMeals";

export async function addRecentMeal(mealId: string): Promise<void> {
	try {
		const recent = await getRecentMealIds();

		// Remove if already exists (to move it to front)
		const filtered = recent.filter((id) => id !== mealId);

		// Add to front
		const updated = [mealId, ...filtered].slice(0, MAX_RECENT);

		await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
	} catch (e) {
		console.error("Error adding recent meal:", e);
	}
}

export async function getRecentMealIds(): Promise<string[]> {
	try {
		const json = await AsyncStorage.getItem(RECENT_KEY);
		return json ? JSON.parse(json) : [];
	} catch (e) {
		console.error("Error getting recent meals:", e);
		return [];
	}
}

export async function clearRecentMeals(): Promise<void> {
	try {
		await AsyncStorage.removeItem(RECENT_KEY);
	} catch (e) {
		console.error("Error clearing recent meals:", e);
	}
}
