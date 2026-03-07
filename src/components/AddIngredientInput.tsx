import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
	index: number;
	ingredient: string;
	measure: string;
	onChange: (index: number, ingredient: string, measure: string) => void;
	onRemove: (index: number) => void;
};

export function AddIngredientInput({
	index,
	ingredient,
	measure,
	onChange,
	onRemove,
}: Props) {
	return (
		<View className="flex-row items-center gap-2 mb-3">
			{/* Index badge */}
			<View className="items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30">
				<Text className="text-xs font-bold text-emerald-400">{index + 1}</Text>
			</View>

			{/* Ingredient input */}
			<TextInput
				value={ingredient}
				onChangeText={(t) => onChange(index, t, measure)}
				placeholder="Ingredient"
				placeholderTextColor="#52525b"
				className="flex-1 px-3 py-3 text-sm text-white border-2 border-zinc-800 bg-zinc-900 rounded-xl"
			/>

			{/* Measure input */}
			<TextInput
				value={measure}
				onChangeText={(t) => onChange(index, ingredient, t)}
				placeholder="Amount"
				placeholderTextColor="#52525b"
				className="w-20 px-3 py-3 text-sm text-white border-2 border-zinc-800 bg-zinc-900 rounded-xl"
			/>

			{/* Remove button */}
			<Pressable
				onPress={() => onRemove(index)}
				className="items-center justify-center w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 active:scale-90"
				accessibilityRole="button"
				accessibilityLabel="Remove ingredient"
			>
				<Text className="text-sm font-bold text-red-400">✕</Text>
			</Pressable>
		</View>
	);
}
