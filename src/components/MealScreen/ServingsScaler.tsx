import { Pressable, Text, View } from "react-native";

type Props = {
	servings: number;
	onDecrement: () => void;
	onIncrement: () => void;
};

export function ServingsScaler({ servings, onDecrement, onIncrement }: Props) {
	const atMin = servings <= 1;
	const atMax = servings >= 10;

	return (
		<View className="flex-row items-center ml-auto gap-1">
			<Pressable
				onPress={onDecrement}
				disabled={atMin}
				className={`items-center justify-center w-8 h-8 rounded-xl border active:scale-[0.95] ${
					atMin
						? "border-zinc-800 bg-zinc-900 opacity-40"
						: "border-zinc-700 bg-zinc-800"
				}`}
			>
				<Text className="text-base font-black text-zinc-300">−</Text>
			</Pressable>

			<View className="items-center justify-center w-10 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
				<Text className="text-sm font-black text-emerald-400">{servings}×</Text>
			</View>

			<Pressable
				onPress={onIncrement}
				disabled={atMax}
				className={`items-center justify-center w-8 h-8 rounded-xl border active:scale-[0.95] ${
					atMax
						? "border-zinc-800 bg-zinc-900 opacity-40"
						: "border-zinc-700 bg-zinc-800"
				}`}
			>
				<Text className="text-base font-black text-zinc-300">+</Text>
			</Pressable>
		</View>
	);
}
