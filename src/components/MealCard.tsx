import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { isMealCached } from "../services/cacheService";
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
			className="mb-4 overflow-hidden shadow-lg bg-zinc-900 rounded-2xl"
		>
			<Image
				source={{ uri: meal.strMealThumb }}
				className="w-full h-40"
				resizeMode="cover"
			/>
			<View className="p-4">
				<View className="flex-row items-start justify-between mb-2">
					<Text className="flex-1 text-lg font-bold text-white">{meal.strMeal}</Text>
				</View>
				<Text className="mb-2 text-zinc-400">{meal.strCategory}</Text>
				{isCached && <OfflineBadge />}
			</View>
		</Pressable>
	);
}
