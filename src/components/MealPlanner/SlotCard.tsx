import { Image, Pressable, Text, View } from "react-native";
import { MEAL_SLOTS, MealSlot } from "../../services/mealPlanService";
import { Meal } from "../../types/Meal";

const SLOT_LABELS: Record<MealSlot, { icon: string; label: string }> = {
	breakfast: { icon: "🌅", label: "Breakfast" },
	lunch: { icon: "☀️", label: "Lunch" },
	dinner: { icon: "🌙", label: "Dinner" },
};

type Props = {
	meal?: Meal;
	slot: MealSlot;
	onPress: () => void;
	onRemove: () => void;
};

export function SlotCard({ meal, slot, onPress, onRemove }: Props) {
	const { icon, label } = SLOT_LABELS[slot];

	if (!meal) {
		return (
			<Pressable
				onPress={onPress}
				className="flex-1 items-center justify-center py-3 px-2 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/40 active:border-emerald-500/50 active:scale-[0.97]"
			>
				<Text className="text-base mb-1">{icon}</Text>
				<Text className="text-xs font-semibold text-zinc-600">{label}</Text>
				<Text className="text-lg font-black text-zinc-700 mt-0.5">+</Text>
			</Pressable>
		);
	}

	return (
		<Pressable
			onPress={onPress}
			className="flex-1 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 active:scale-[0.97]"
		>
			{meal.strMealThumb ? (
				<Image
					source={{ uri: meal.strMealThumb }}
					style={{ height: 56 }}
					resizeMode="cover"
					className="w-full"
				/>
			) : (
				<View className="w-full h-14 items-center justify-center bg-zinc-800">
					<Text className="text-2xl">{icon}</Text>
				</View>
			)}

			<View className="px-2 py-1.5">
				<View className="flex-row items-center mb-0.5">
					<Text className="text-xs mr-1">{icon}</Text>
					<Text className="text-xs font-semibold text-zinc-500">{label}</Text>
				</View>
				<Text
					className="text-xs font-bold text-white leading-tight"
					numberOfLines={2}
				>
					{meal.strMeal}
				</Text>
			</View>

			<Pressable
				onPress={(e) => {
					e.stopPropagation();
					onRemove();
				}}
				hitSlop={4}
				className="absolute top-1.5 right-1.5 items-center justify-center w-5 h-5 rounded-full bg-zinc-950/80 active:bg-red-900/60"
			>
				<Text className="text-xs font-black text-zinc-400">✕</Text>
			</Pressable>
		</Pressable>
	);
}

export { SLOT_LABELS, MEAL_SLOTS };
