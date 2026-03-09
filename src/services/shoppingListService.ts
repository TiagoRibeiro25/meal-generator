import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "../types/Meal";

export const SHOPPING_LIST_KEY = "@shopping_list";

export type ShoppingListItem = {
	id: string;
	ingredient: string;
	measure: string;
	checked: boolean;
	mealId: string;
	mealName: string;
};

export async function getShoppingList(): Promise<ShoppingListItem[]> {
	try {
		const json = await AsyncStorage.getItem(SHOPPING_LIST_KEY);
		return json ? JSON.parse(json) : [];
	} catch (e) {
		console.error("Error getting shopping list:", e);
		return [];
	}
}

async function saveShoppingList(items: ShoppingListItem[]): Promise<void> {
	try {
		await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items));
	} catch (e) {
		console.error("Error saving shopping list:", e);
	}
}

export async function addMealToShoppingList(meal: Meal): Promise<void> {
	try {
		const current = await getShoppingList();

		// Remove any existing items from the same meal to avoid duplicates
		const filtered = current.filter((item) => item.mealId !== meal.idMeal);

		const newItems: ShoppingListItem[] = (meal.ingredients ?? [])
			.filter((ing) => ing.ingredient.trim())
			.map((ing, index) => ({
				id: `${meal.idMeal}-${index}-${ing.ingredient.toLowerCase().replace(/\s+/g, "-")}`,
				ingredient: ing.ingredient,
				measure: ing.measure,
				checked: false,
				mealId: meal.idMeal,
				mealName: meal.strMeal,
			}));

		await saveShoppingList([...filtered, ...newItems]);
	} catch (e) {
		console.error("Error adding meal to shopping list:", e);
	}
}

export async function removeMealFromShoppingList(
	mealId: string,
): Promise<void> {
	try {
		const current = await getShoppingList();
		const updated = current.filter((item) => item.mealId !== mealId);
		await saveShoppingList(updated);
	} catch (e) {
		console.error("Error removing meal from shopping list:", e);
	}
}

export async function toggleShoppingItem(id: string): Promise<void> {
	try {
		const current = await getShoppingList();
		const updated = current.map((item) =>
			item.id === id ? { ...item, checked: !item.checked } : item,
		);
		await saveShoppingList(updated);
	} catch (e) {
		console.error("Error toggling shopping item:", e);
	}
}

export async function removeShoppingItem(id: string): Promise<void> {
	try {
		const current = await getShoppingList();
		const updated = current.filter((item) => item.id !== id);
		await saveShoppingList(updated);
	} catch (e) {
		console.error("Error removing shopping item:", e);
	}
}

export async function clearCheckedItems(): Promise<void> {
	try {
		const current = await getShoppingList();
		const updated = current.filter((item) => !item.checked);
		await saveShoppingList(updated);
	} catch (e) {
		console.error("Error clearing checked items:", e);
	}
}

export async function clearShoppingList(): Promise<void> {
	try {
		await AsyncStorage.removeItem(SHOPPING_LIST_KEY);
	} catch (e) {
		console.error("Error clearing shopping list:", e);
	}
}

export async function isMealInShoppingList(mealId: string): Promise<boolean> {
	try {
		const current = await getShoppingList();
		return current.some((item) => item.mealId === mealId);
	} catch (e) {
		console.error("Error checking shopping list:", e);
		return false;
	}
}

export function groupByMeal(
	items: ShoppingListItem[],
): { mealId: string; mealName: string; items: ShoppingListItem[] }[] {
	const map = new Map<
		string,
		{ mealId: string; mealName: string; items: ShoppingListItem[] }
	>();

	for (const item of items) {
		if (!map.has(item.mealId)) {
			map.set(item.mealId, {
				mealId: item.mealId,
				mealName: item.mealName,
				items: [],
			});
		}
		map.get(item.mealId)!.items.push(item);
	}

	return Array.from(map.values());
}
