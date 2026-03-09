import { useEffect, useState } from "react";
import { fetchMealsByIngredient } from "../services/mealService";
import { Meal } from "../types/Meal";

export function useMealsByIngredient(ingredient: string | null) {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!ingredient) {
			setMeals([]);
			setError(null);
			return;
		}

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const fetchedMeals = await fetchMealsByIngredient(ingredient!);
				setMeals(fetchedMeals);
			} catch (e: any) {
				console.error(e);
				setError(e.message || "Failed to load meals");
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [ingredient]);

	return { meals, loading, error };
}
