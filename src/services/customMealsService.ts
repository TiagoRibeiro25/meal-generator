import AsyncStorage from "@react-native-async-storage/async-storage";
import { CUSTOM_MEALS_KEY } from "../config/constants";
import { Meal } from "../types/Meal";

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
    const updated = [toSave, ...current.filter((m) => m.idMeal !== id)];
    await AsyncStorage.setItem(CUSTOM_MEALS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving custom meal:", e);
  }
}

export async function removeCustomMeal(mealId: string): Promise<void> {
  try {
    const current = await getCustomMeals();
    const updated = current.filter((m) => m.idMeal !== mealId);
    await AsyncStorage.setItem(CUSTOM_MEALS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error removing custom meal:", e);
  }
}
