import { useCallback, useEffect, useState } from "react";
import { fetchAreas } from "../services/mealService";

export function useAreas() {
	const [areas, setAreas] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const fetched = await fetchAreas();
			setAreas(fetched);
		} catch (e: any) {
			console.error(e);
			setError(e.message || "Failed to load areas");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	return { areas, loading, error, reload: load };
}
