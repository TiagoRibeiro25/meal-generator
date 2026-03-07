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
			className="mb-4 overflow-hidden border border-zinc-800 bg-zinc-900 rounded-3xl active:scale-[0.98]"
		>
			{/* Thumbnail */}
			<View className="relative">
				<Image
					source={{ uri: meal.strMealThumb }}
					className="w-full"
					style={{ height: 192 }}
					resizeMode="cover"
				/>

				{/* Local badge overlay */}
				{meal.isLocal && (
					<View className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-violet-500/40">
						<Text className="text-xs font-semibold text-violet-400">
							✏️ Custom
						</Text>
					</View>
				)}
			</View>

			{/* Content */}
			<View className="p-4">
				<Text
					className="mb-3 text-lg font-bold leading-snug text-white"
					numberOfLines={2}
					style={{ letterSpacing: -0.2 }}
				>
					{meal.strMeal}
				</Text>

				<View className="flex-row items-center justify-between">
					<View className="flex-row flex-wrap gap-2">
						{meal.strCategory ? (
							<View className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
								<Text className="text-xs font-semibold text-emerald-400">
									{meal.strCategory}
								</Text>
							</View>
						) : null}
						{meal.strArea ? (
							<View className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25">
								<Text className="text-xs font-semibold text-cyan-400">
									🌍 {meal.strArea}
								</Text>
							</View>
						) : null}
					</View>

					{isCached && <OfflineBadge />}
				</View>
			</View>
		</Pressable>
	);
}
