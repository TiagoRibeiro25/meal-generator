import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLLECTIONS_KEY } from "../config/constants";
import { Meal } from "../types/Meal";

export type Collection = {
	id: string;
	name: string;
	emoji: string;
	createdAt: number;
	meals: Meal[];
};

async function getCollectionsMap(): Promise<Collection[]> {
	try {
		const json = await AsyncStorage.getItem(COLLECTIONS_KEY);
		return json ? JSON.parse(json) : [];
	} catch (e) {
		console.error("Error reading collections:", e);
		return [];
	}
}

async function saveCollectionsMap(collections: Collection[]): Promise<void> {
	try {
		await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
	} catch (e) {
		console.error("Error saving collections:", e);
	}
}

export async function getCollections(): Promise<Collection[]> {
	return getCollectionsMap();
}

export async function getCollection(id: string): Promise<Collection | null> {
	const collections = await getCollectionsMap();
	return collections.find((c) => c.id === id) ?? null;
}

export async function createCollection(
	name: string,
	emoji: string,
): Promise<Collection> {
	const collections = await getCollectionsMap();
	const newCollection: Collection = {
		id: `col-${Date.now()}`,
		name: name.trim(),
		emoji,
		createdAt: Date.now(),
		meals: [],
	};
	await saveCollectionsMap([newCollection, ...collections]);
	return newCollection;
}

export async function renameCollection(
	id: string,
	name: string,
	emoji: string,
): Promise<void> {
	const collections = await getCollectionsMap();
	const updated = collections.map((c) =>
		c.id === id ? { ...c, name: name.trim(), emoji } : c,
	);
	await saveCollectionsMap(updated);
}

export async function deleteCollection(id: string): Promise<void> {
	const collections = await getCollectionsMap();
	await saveCollectionsMap(collections.filter((c) => c.id !== id));
}

export async function addMealToCollection(
	collectionId: string,
	meal: Meal,
): Promise<void> {
	const collections = await getCollectionsMap();
	const updated = collections.map((c) => {
		if (c.id !== collectionId) return c;
		const alreadyIn = c.meals.some((m) => m.idMeal === meal.idMeal);
		if (alreadyIn) return c;
		return { ...c, meals: [...c.meals, meal] };
	});
	await saveCollectionsMap(updated);
}

export async function removeMealFromCollection(
	collectionId: string,
	mealId: string,
): Promise<void> {
	const collections = await getCollectionsMap();
	const updated = collections.map((c) => {
		if (c.id !== collectionId) return c;
		return { ...c, meals: c.meals.filter((m) => m.idMeal !== mealId) };
	});
	await saveCollectionsMap(updated);
}

export async function isMealInCollection(
	collectionId: string,
	mealId: string,
): Promise<boolean> {
	const collection = await getCollection(collectionId);
	return collection?.meals.some((m) => m.idMeal === mealId) ?? false;
}

export async function getCollectionsForMeal(
	mealId: string,
): Promise<Collection[]> {
	const collections = await getCollectionsMap();
	return collections.filter((c) => c.meals.some((m) => m.idMeal === mealId));
}

export async function reorderMealsInCollection(
	collectionId: string,
	meals: Meal[],
): Promise<void> {
	const collections = await getCollectionsMap();
	const updated = collections.map((c) =>
		c.id === collectionId ? { ...c, meals } : c,
	);
	await saveCollectionsMap(updated);
}
