import { Text, View } from "react-native";

type Props = {
	ingredients: { ingredient: string; measure: string }[];
};

export function IngredientsList({ ingredients }: Props) {
	const filtered = ingredients.filter((item) => item.ingredient?.trim());

	if (filtered.length === 0) {
		return (
			<View className="items-center py-6">
				<Text className="text-sm text-zinc-500">No ingredients listed.</Text>
			</View>
		);
	}

	return (
		<View className="gap-2">
			{filtered.map((item, index) => (
				<View
					key={index}
					className="flex-row items-center px-4 py-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/50"
				>
					{/* Index pill */}
					<View className="items-center justify-center w-7 h-7 mr-3 rounded-full bg-emerald-500/15 border border-emerald-500/30">
						<Text className="text-xs font-bold text-emerald-400">
							{index + 1}
						</Text>
					</View>

					{/* Ingredient name */}
					<Text className="flex-1 text-sm font-semibold text-white">
						{item.ingredient}
					</Text>

					{/* Measure badge */}
					{item.measure?.trim() ? (
						<View className="ml-3 px-2.5 py-1 rounded-full bg-zinc-700/80">
							<Text className="text-xs font-semibold text-zinc-300">
								{item.measure.trim()}
							</Text>
						</View>
					) : null}
				</View>
			))}
		</View>
	);
}
