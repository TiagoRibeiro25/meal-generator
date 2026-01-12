import AsyncStorage from "@react-native-async-storage/async-storage";
import { FAVOURITES_KEY } from "../config/constants";
import { Meal } from "../types/Meal";
import { cacheMeal } from "./cacheService";

export async function getFavourites(): Promise<Meal[]> {
	try {
		const jsonValue = await AsyncStorage.getItem(FAVOURITES_KEY);
		return jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		console.error("Error reading favourites:", e);
		return [];
	}
}

export async function saveFavourite(meal: Meal): Promise<void> {
	try {
		const favourites = await getFavourites();
		const exists = favourites.some((fav) => fav.idMeal === meal.idMeal);

		if (!exists) {
			const updatedFavourites = [...favourites, meal];
			const jsonValue = JSON.stringify(updatedFavourites);
			await AsyncStorage.setItem(FAVOURITES_KEY, jsonValue);

			await cacheMeal(meal);
		}
	} catch (e) {
		console.error("Error saving favourite:", e);
	}
}

export async function removeFavourite(mealId: string): Promise<void> {
	try {
		const favourites = await getFavourites();
		const updatedFavourites = favourites.filter((fav) => fav.idMeal !== mealId);
		const jsonValue = JSON.stringify(updatedFavourites);
		await AsyncStorage.setItem(FAVOURITES_KEY, jsonValue);
	} catch (e) {
		console.error("Error removing favourite:", e);
	}
}

export async function isFavourite(mealId: string): Promise<boolean> {
	try {
		const favourites = await getFavourites();
		return favourites.some((fav) => fav.idMeal === mealId);
	} catch (e) {
		console.error("Error checking favourite:", e);
		return false;
	}
}
