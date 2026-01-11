import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { isMealCached } from "../services";
import { Meal } from "../types/Meal";
import { OfflineBadge } from "./OfflineBadge";

type Props = {
	meal: Meal;
	onPress: () => void;
};

export function MealCard({ meal, onPress }: Props) {
	const [isCached, setIsCached] = useState(false);

	useEffect(() => {
		async function checkCache() {
			const cached = await isMealCached(meal.idMeal);
			setIsCached(cached);
		}
		checkCache();
	}, [meal.idMeal]);

	return (
		<Pressable
			onPress={onPress}
			className="mb-4 overflow-hidden shadow-2xl bg-zinc-900 rounded-3xl active:scale-[0.98]"
		>
			<View className="relative">
				<Image
					source={{ uri: meal.strMealThumb }}
					className="w-full h-48"
					resizeMode="cover"
				/>
				{/* Gradient Overlay */}
				<View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent" />
			</View>

			<View className="p-5">
				<Text className="mb-2 text-xl font-bold text-white" numberOfLines={2}>
					{meal.strMeal}
				</Text>

				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-2">
						<View className="px-3 py-1 rounded-full bg-zinc-800">
							<Text className="text-sm font-semibold text-emerald-400">
								{meal.strCategory}
							</Text>
						</View>
						{meal.strArea && (
							<View className="px-3 py-1 rounded-full bg-zinc-800">
								<Text className="text-sm font-semibold text-cyan-400">
									{meal.strArea}
								</Text>
							</View>
						)}
					</View>
				</View>

				{isCached && <OfflineBadge className="mt-3" />}
			</View>
		</Pressable>
	);
}
