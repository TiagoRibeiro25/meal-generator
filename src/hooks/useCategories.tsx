import { useCallback } from "react";
import { fetchCategories } from "../services/mealService";
import { useRemoteList } from "./useRemoteList";

export function useCategories() {
	const fetcher = useCallback(fetchCategories, []);

	const {
		data: categories,
		loading,
		error,
		reload,
	} = useRemoteList({
		fetcher,
		label: "categories",
	});

	return { categories, loading, error, reload };
}
