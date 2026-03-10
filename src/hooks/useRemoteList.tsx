import { useCallback, useEffect, useState } from "react";

type UseRemoteListOptions<T> = {
	fetcher: () => Promise<T[]>;
	label?: string;
};

type UseRemoteListResult<T> = {
	data: T[];
	loading: boolean;
	error: string | null;
	reload: () => void;
};

export function useRemoteList<T>({
	fetcher,
	label = "items",
}: UseRemoteListOptions<T>): UseRemoteListResult<T> {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await fetcher();
			setData(result);
		} catch (e: any) {
			console.error(`[useRemoteList] Failed to load ${label}:`, e);
			setError(e?.message ?? `Failed to load ${label}`);
		} finally {
			setLoading(false);
		}
	}, [fetcher, label]);

	useEffect(() => {
		load();
	}, [load]);

	return { data, loading, error, reload: load };
}
