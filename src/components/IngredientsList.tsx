import { Text, View } from "react-native";

type Props = {
	ingredients: { ingredient: string; measure: string }[];
	servings?: number;
};

/**
 * Attempts to scale a measure string by `multiplier`.
 * Handles simple cases like "2 tbsp", "1/2 cup", "100g".
 * Falls back to the original string when it cannot parse a leading number.
 */
function scaleMeasure(measure: string, multiplier: number): string {
	if (multiplier === 1) return measure;

	const trimmed = measure.trim();

	// Match a leading fraction (e.g. "1/2") or decimal/integer
	const fractionMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)(.*)/);
	if (fractionMatch) {
		const num = parseInt(fractionMatch[1], 10);
		const den = parseInt(fractionMatch[2], 10);
		const rest = fractionMatch[3];
		const scaled = (num / den) * multiplier;
		return `${formatNumber(scaled)}${rest}`;
	}

	const numberMatch = trimmed.match(/^(\d+(?:\.\d+)?)(.*)/);
	if (numberMatch) {
		const value = parseFloat(numberMatch[1]);
		const rest = numberMatch[2];
		const scaled = value * multiplier;
		return `${formatNumber(scaled)}${rest}`;
	}

	// Could not detect a leading number — return as-is
	return trimmed;
}

function formatNumber(n: number): string {
	// Round to at most 2 decimal places and strip trailing zeros
	const rounded = Math.round(n * 100) / 100;
	return rounded % 1 === 0 ? String(rounded) : String(rounded);
}

export function IngredientsList({ ingredients, servings = 1 }: Props) {
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
								{scaleMeasure(item.measure, servings)}
							</Text>
						</View>
					) : null}
				</View>
			))}
		</View>
	);
}
