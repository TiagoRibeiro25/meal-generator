import AsyncStorage from "@react-native-async-storage/async-storage";
import { CUSTOM_MEALS_KEY } from "../config/constants";
import { Meal } from "../types/Meal";
import { deleteLocalImageIfExists } from "./imageService";

export async function getCustomMeals(): Promise<Meal[]> {
	try {
		const json = await AsyncStorage.getItem(CUSTOM_MEALS_KEY);
		return json ? JSON.parse(json) : [];
	} catch (e) {
		console.error("Error getting custom meals:", e);
		return [];
	}
}

export async function saveCustomMeal(meal: Meal): Promise<void> {
	try {
		const current = await getCustomMeals();
		const id = meal.idMeal || `local-${Date.now()}`;
		const toSave: Meal = { ...meal, idMeal: id, isLocal: true };

		// If updating an existing meal and it had a stored image that changed, delete the old file
		const previous = current.find((m) => m.idMeal === id);
		if (
			previous?.strMealThumb &&
			previous.strMealThumb !== toSave.strMealThumb
		) {
			await deleteLocalImageIfExists(previous.strMealThumb);
		}

		const updated = [toSave, ...current.filter((m) => m.idMeal !== id)];
		await AsyncStorage.setItem(CUSTOM_MEALS_KEY, JSON.stringify(updated));
	} catch (e) {
		console.error("Error saving custom meal:", e);
	}
}

export async function removeCustomMeal(mealId: string): Promise<void> {
	try {
		const current = await getCustomMeals();
		const found = current.find((m) => m.idMeal === mealId);

		// delete stored image if it exists in app storage
		if (found?.strMealThumb) {
			await deleteLocalImageIfExists(found.strMealThumb);
		}

		const updated = current.filter((m) => m.idMeal !== mealId);
		await AsyncStorage.setItem(CUSTOM_MEALS_KEY, JSON.stringify(updated));
	} catch (e) {
		console.error("Error removing custom meal:", e);
	}
}
