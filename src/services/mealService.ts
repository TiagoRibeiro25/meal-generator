import { API_BASE_URL } from "../config/api";
import { Meal } from "../types/Meal";
import { cacheMeal, getCachedMeal } from "./cacheService";

class NetworkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NetworkError";
	}
}

export async function fetchCategories(): Promise<string[]> {
	try {
		const res = await fetch(`${API_BASE_URL}/list.php?c=list`);
		if (!res.ok) {
			throw new NetworkError("Failed to fetch categories");
		}
		const data = await res.json();
		return data.meals.map((c: any) => c.strCategory);
	} catch (error) {
		if (error instanceof TypeError) {
			throw new NetworkError("No internet connection");
		}
		throw error;
	}
}

export async function fetchMealsByCategory(category: string): Promise<Meal[]> {
	try {
		const res = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
		if (!res.ok) {
			throw new NetworkError("Failed to fetch meals");
		}
		const data = await res.json();

		return data.meals.map((m: any) => ({
			idMeal: m.idMeal,
			strMeal: m.strMeal,
			strCategory: category,
			strArea: "",
			strInstructions: "",
			strMealThumb: m.strMealThumb,
			strYoutube: "",
			strSource: "",
			ingredients: [],
		}));
	} catch (error) {
		if (error instanceof TypeError) {
			throw new NetworkError("No internet connection");
		}
		throw error;
	}
}

export async function fetchMealById(id: string): Promise<Meal> {
	const cached = await getCachedMeal(id);

	try {
		const res = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
		if (!res.ok) {
			throw new NetworkError("Failed to fetch meal details");
		}
		const data = await res.json();
		const apiMeal = data.meals[0];

		const ingredients = [];
		for (let i = 1; i <= 20; i++) {
			const ingredient = apiMeal[`strIngredient${i}`];
			const measure = apiMeal[`strMeasure${i}`];
			if (ingredient && ingredient.trim() !== "") {
				ingredients.push({ ingredient, measure });
			}
		}

		const meal: Meal = {
			idMeal: apiMeal.idMeal,
			strMeal: apiMeal.strMeal,
			strCategory: apiMeal.strCategory,
			strArea: apiMeal.strArea,
			strInstructions: apiMeal.strInstructions,
			strMealThumb: apiMeal.strMealThumb,
			strYoutube: apiMeal.strYoutube,
			strSource: apiMeal.strSource,
			ingredients,
		};

		await cacheMeal(meal);

		return meal;
	} catch (error) {
		if (cached) {
			console.log("Using cached meal due to network error");
			return cached;
		}
		if (error instanceof TypeError) {
			throw new NetworkError("No internet connection");
		}
		throw error;
	}
}

export async function searchMealsByName(name: string): Promise<Meal[]> {
	try {
		const res = await fetch(`${API_BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
		if (!res.ok) {
			throw new NetworkError("Failed to search meals");
		}
		const data = await res.json();

		if (!data.meals) return [];

		return data.meals.map((m: any) => {
			const ingredients = [];
			for (let i = 1; i <= 20; i++) {
				const ingredient = m[`strIngredient${i}`];
				const measure = m[`strMeasure${i}`];
				if (ingredient && ingredient.trim() !== "") {
					ingredients.push({ ingredient, measure });
				}
			}

			return {
				idMeal: m.idMeal,
				strMeal: m.strMeal,
				strCategory: m.strCategory,
				strArea: m.strArea,
				strInstructions: m.strInstructions,
				strMealThumb: m.strMealThumb,
				strYoutube: m.strYoutube,
				strSource: m.strSource,
				ingredients,
			};
		});
	} catch (error) {
		if (error instanceof TypeError) {
			throw new NetworkError("No internet connection");
		}
		throw error;
	}
}
