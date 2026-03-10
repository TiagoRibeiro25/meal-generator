import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useNetworkStatus } from "../../hooks";
import { fetchRandomMeal } from "../../services/mealService";
import { Meal } from "../../types/Meal";

type Props = {
	onMealFetched: (meal: Meal) => void;
};

export function SurpriseMeButton({ onMealFetched }: Props) {
	const isConnected = useNetworkStatus();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePress = useCallback(async () => {
		if (loading) return;
		setError(null);
		setLoading(true);
		try {
			const meal = await fetchRandomMeal();
			onMealFetched(meal);
		} catch (e: any) {
			setError("Couldn't fetch a random meal. Check your connection.");
			console.error("[SurpriseMeButton] Random meal error:", e);
		} finally {
			setLoading(false);
		}
	}, [loading, onMealFetched]);

	const isDisabled = loading || isConnected === false;

	return (
		<View className="px-6 mb-6">
			<Pressable
				onPress={handlePress}
				disabled={isDisabled}
				className={`flex-row items-center justify-center py-5 rounded-3xl border-2 active:scale-[0.97] ${
					isDisabled
						? "border-zinc-700 bg-zinc-900 opacity-60"
						: "border-amber-500/50 bg-amber-500/10 active:bg-amber-500/20"
				}`}
			>
				{loading ? (
					<>
						<ActivityIndicator
							size="small"
							color="#f59e0b"
							style={{ marginRight: 10 }}
						/>
						<Text className="text-base font-black text-amber-400">
							Finding a meal…
						</Text>
					</>
				) : (
					<>
						<Text className="mr-3 text-3xl">🎲</Text>
						<View>
							<Text className="text-base font-black text-amber-300">
								Surprise Me!
							</Text>
							<Text className="text-xs text-amber-600 mt-0.5">
								Discover a random recipe
							</Text>
						</View>
					</>
				)}
			</Pressable>

			{error && (
				<View className="mt-3 px-4 py-3 rounded-2xl bg-red-900/20 border border-red-800/40">
					<Text className="text-sm text-red-400 text-center">{error}</Text>
				</View>
			)}
		</View>
	);
}
