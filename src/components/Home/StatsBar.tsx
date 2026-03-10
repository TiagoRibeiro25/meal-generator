import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SkeletonLoader } from "../SkeletonLoader";
import { fetchMealCounts } from "../../services/mealService";

export function StatsBar() {
	const [categories, setCategories] = useState<number | null>(null);
	const [meals, setMeals] = useState<number | null>(null);

	useEffect(() => {
		fetchMealCounts()
			.then(({ categories, meals }) => {
				setCategories(categories);
				setMeals(meals);
			})
			.catch(() => {});
	}, []);

	const stats = [
		{
			value: categories !== null ? `${categories}` : null,
			label: "Categories",
		},
		{ value: meals !== null ? `${meals}` : null, label: "Recipes" },
		{ value: "∞", label: "Inspiration" },
	];

	return (
		<View className="flex-row mx-6 mb-6 overflow-hidden divide-x divide-zinc-800 rounded-2xl bg-zinc-900">
			{stats.map((stat) => (
				<View key={stat.label} className="items-center flex-1 py-4">
					{stat.value !== null ? (
						<Text className="text-2xl font-black text-emerald-400">
							{stat.value}
						</Text>
					) : (
						<SkeletonLoader width={36} height={28} borderRadius={6} />
					)}
					<Text className="mt-0.5 text-xs font-medium text-zinc-500">
						{stat.label}
					</Text>
				</View>
			))}
		</View>
	);
}
