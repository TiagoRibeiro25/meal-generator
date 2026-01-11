import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
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

    // If updating an existing meal and it had a stored image that changed, delete the old file
    const previous = current.find((m) => m.idMeal === id);
    const _doc = FileSystem.documentDirectory || "";
    if (
      previous?.strMealThumb &&
      previous.strMealThumb !== toSave.strMealThumb &&
      previous.strMealThumb.startsWith(_doc)
    ) {
      try {
        await FileSystem.deleteAsync(previous.strMealThumb, { idempotent: true });
      } catch (e) {
        console.error("Failed to delete previous meal image:", e);
      }
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
    const _doc2 = FileSystem.documentDirectory || "";
    if (found?.strMealThumb && found.strMealThumb.startsWith(_doc2)) {
      try {
        await FileSystem.deleteAsync(found.strMealThumb, { idempotent: true });
      } catch (e) {
        console.error("Failed to delete meal image on remove:", e);
      }
    }

    const updated = current.filter((m) => m.idMeal !== mealId);
    await AsyncStorage.setItem(CUSTOM_MEALS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error removing custom meal:", e);
  }
}
