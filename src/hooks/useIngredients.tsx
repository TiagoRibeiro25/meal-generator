import { useCallback, useEffect, useState } from "react";
import { fetchIngredients } from "../services/mealService";

type UseIngredientsResult = {
	allIngredients: string[];
	filteredIngredients: string[];
	query: string;
	setQuery: (q: string) => void;
	loading: boolean;
	error: string | null;
};

export function useIngredients(active: boolean): UseIngredientsResult {
	const [allIngredients, setAllIngredients] = useState<string[]>([]);
	const [filteredIngredients, setFilteredIngredients] = useState<string[]>([]);
	const [query, setQueryRaw] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!active || allIngredients.length > 0) return;

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const list = await fetchIngredients();
				const sorted = [...list].sort((a, b) => a.localeCompare(b));
				setAllIngredients(sorted);
				setFilteredIngredients(sorted);
			} catch (e: any) {
				console.error("[useIngredients] Failed to load ingredients:", e);
				setError(e?.message ?? "Failed to load ingredients");
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [active, allIngredients.length]);

	useEffect(() => {
		if (!query.trim()) {
			setFilteredIngredients(allIngredients);
			return;
		}
		const q = query.toLowerCase();
		setFilteredIngredients(
			allIngredients.filter((ing) => ing.toLowerCase().includes(q)),
		);
	}, [query, allIngredients]);

	const setQuery = useCallback((q: string) => {
		setQueryRaw(q);
	}, []);

	return {
		allIngredients,
		filteredIngredients,
		query,
		setQuery,
		loading,
		error,
	};
}
