import { API_BASE_URL } from "../config/constants";
import { ApiMealDetail, ApiMealSummary, ApiResponse } from "../types/api";
import { NetworkError } from "../types/errors";
import { Meal } from "../types/Meal";
import { cacheMeal, getCachedMeal } from "./cacheService";

async function fetchApi<T>(endpoint: string): Promise<T> {
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`);

		if (!response.ok) {
			throw new NetworkError(
				`API Error: ${response.status} ${response.statusText}`,
			);
		}

		return await response.json();
	} catch (error) {
		if (error instanceof TypeError) {
			throw new NetworkError("No internet connection");
		}
		throw error;
	}
}

function parseIngredients(
	meal: ApiMealDetail,
): { ingredient: string; measure: string }[] {
	const ingredients: { ingredient: string; measure: string }[] = [];

	for (let i = 1; i <= 20; i++) {
		const ingredient = meal[`strIngredient${i}` as keyof ApiMealDetail];
		const measure = meal[`strMeasure${i}` as keyof ApiMealDetail];

		if (
			ingredient &&
			typeof ingredient === "string" &&
			ingredient.trim() !== ""
		) {
			ingredients.push({
				ingredient,
				measure: typeof measure === "string" ? measure : "",
			});
		}
	}

	return ingredients;
}

function transformMealDetail(apiMeal: ApiMealDetail): Meal {
	return {
		idMeal: apiMeal.idMeal,
		strMeal: apiMeal.strMeal,
		strCategory: apiMeal.strCategory,
		strArea: apiMeal.strArea,
		strInstructions: apiMeal.strInstructions,
		strMealThumb: apiMeal.strMealThumb,
		strYoutube: apiMeal.strYoutube,
		strSource: apiMeal.strSource,
		ingredients: parseIngredients(apiMeal),
	};
}

export async function fetchCategories(): Promise<string[]> {
	const data =
		await fetchApi<ApiResponse<{ strCategory: string }>>("/list.php?c=list");
	return data.meals?.map((c) => c.strCategory) || [];
}

export async function fetchMealsByCategory(category: string): Promise<Meal[]> {
	const data = await fetchApi<ApiResponse<ApiMealSummary>>(
		`/filter.php?c=${category}`,
	);

	return (
		data.meals?.map((m) => ({
			idMeal: m.idMeal,
			strMeal: m.strMeal,
			strCategory: category,
			strArea: "",
			strInstructions: "",
			strMealThumb: m.strMealThumb,
			strYoutube: "",
			strSource: "",
			ingredients: [],
		})) || []
	);
}

export async function fetchMealById(id: string): Promise<Meal> {
	const cached = await getCachedMeal(id);

	try {
		const data = await fetchApi<ApiResponse<ApiMealDetail>>(
			`/lookup.php?i=${id}`,
		);

		if (!data.meals || data.meals.length === 0) {
			throw new NetworkError("Meal not found");
		}

		const meal = transformMealDetail(data.meals[0]);
		await cacheMeal(meal);

		return meal;
	} catch (error) {
		if (cached) {
			console.log("Using cached meal due to network error");
			return cached;
		}
		throw error;
	}
}

export async function searchMealsByName(name: string): Promise<Meal[]> {
	const data = await fetchApi<ApiResponse<ApiMealDetail>>(
		`/search.php?s=${encodeURIComponent(name)}`,
	);

	return data.meals?.map(transformMealDetail) || [];
}

export async function fetchRandomMeal(): Promise<Meal> {
	const data = await fetchApi<ApiResponse<ApiMealDetail>>("/random.php");

	if (!data.meals || data.meals.length === 0) {
		throw new NetworkError("Could not fetch a random meal");
	}

	const meal = transformMealDetail(data.meals[0]);
	await cacheMeal(meal);
	return meal;
}

export async function fetchMealsByArea(area: string): Promise<Meal[]> {
	const data = await fetchApi<ApiResponse<ApiMealSummary>>(
		`/filter.php?a=${encodeURIComponent(area)}`,
	);

	return (
		data.meals?.map((m) => ({
			idMeal: m.idMeal,
			strMeal: m.strMeal,
			strCategory: "",
			strArea: area,
			strInstructions: "",
			strMealThumb: m.strMealThumb,
			strYoutube: "",
			strSource: "",
			ingredients: [],
		})) || []
	);
}

export async function fetchAreas(): Promise<string[]> {
	const data =
		await fetchApi<ApiResponse<{ strArea: string }>>("/list.php?a=list");
	return data.meals?.map((a) => a.strArea) || [];
}

export async function fetchIngredients(): Promise<string[]> {
	const data =
		await fetchApi<ApiResponse<{ strIngredient: string }>>("/list.php?i=list");
	return data.meals?.map((i) => i.strIngredient) || [];
}

export async function fetchMealsByIngredient(
	ingredient: string,
): Promise<Meal[]> {
	const data = await fetchApi<ApiResponse<ApiMealSummary>>(
		`/filter.php?i=${encodeURIComponent(ingredient)}`,
	);

	return (
		data.meals?.map((m) => ({
			idMeal: m.idMeal,
			strMeal: m.strMeal,
			strCategory: "",
			strArea: "",
			strInstructions: "",
			strMealThumb: m.strMealThumb,
			strYoutube: "",
			strSource: "",
			ingredients: [],
		})) || []
	);
}
