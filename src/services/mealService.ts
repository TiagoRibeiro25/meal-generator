import { Meal } from "../types/Meal";

export async function fetchCategories(): Promise<string[]> {
	const res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list");
	const data = await res.json();
	return data.meals.map((c: any) => c.strCategory);
}

export async function fetchMealsByCategory(category: string): Promise<Meal[]> {
	const res = await fetch(
		`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
	);
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
}

export async function fetchMealById(id: string): Promise<Meal> {
	const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
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

	return {
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
}

export async function searchMealsByName(name: string): Promise<Meal[]> {
	const res = await fetch(
		`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`
	);
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
}
