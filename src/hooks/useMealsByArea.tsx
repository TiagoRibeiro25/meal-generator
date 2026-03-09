import { useEffect, useState } from "react";
import { fetchMealsByArea } from "../services/mealService";
import { Meal } from "../types/Meal";

export function useMealsByArea(area: string | null) {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!area) {
			setMeals([]);
			setError(null);
			return;
		}

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const fetchedMeals = await fetchMealsByArea(area!);
				setMeals(fetchedMeals);
			} catch (e: any) {
				console.error(e);
				setError(e.message || "Failed to load meals");
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [area]);

	return { meals, loading, error };
}
