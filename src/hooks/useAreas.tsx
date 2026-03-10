import { useCallback } from "react";
import { fetchAreas } from "../services/mealService";
import { useRemoteList } from "./useRemoteList";

export function useAreas() {
	const fetcher = useCallback(fetchAreas, []);

	const {
		data: areas,
		loading,
		error,
		reload,
	} = useRemoteList({
		fetcher,
		label: "areas",
	});

	return { areas, loading, error, reload };
}
