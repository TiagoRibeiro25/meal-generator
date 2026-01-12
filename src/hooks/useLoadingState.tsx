import { useCallback, useState } from "react";

export function useLoadingState() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const execute = useCallback(
		async <T,>(
			action: () => Promise<T>,
			errorMessage?: string,
		): Promise<T | null> => {
			setLoading(true);
			setError(null);

			try {
				const result = await action();
				return result;
			} catch (e: any) {
				console.error(e);
				setError(errorMessage || e.message || "An error occurred");
				return null;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const reset = useCallback(() => {
		setLoading(false);
		setError(null);
	}, []);

	return { loading, error, execute, reset, setError };
}
