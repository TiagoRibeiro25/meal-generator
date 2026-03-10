import { Pressable, Text, View } from "react-native";
import { DayOfWeek, DayPlan, MEAL_SLOTS, MealSlot } from "../../services/mealPlanService";
import { SlotCard } from "./SlotCard";

type Props = {
	day: DayOfWeek;
	dayPlan: DayPlan;
	isToday: boolean;
	onSlotPress: (day: DayOfWeek, slot: MealSlot) => void;
	onSlotRemove: (day: DayOfWeek, slot: MealSlot) => void;
	onClearDay: (day: DayOfWeek) => void;
};

/**
 * A card representing a single day in the weekly meal planner.
 * Renders three SlotCard cells (breakfast, lunch, dinner) and a clear button.
 */
export function DayCard({
	day,
	dayPlan,
	isToday,
	onSlotPress,
	onSlotRemove,
	onClearDay,
}: Props) {
	const hasMeals = MEAL_SLOTS.some((s) => dayPlan[s]);
	const mealCount = MEAL_SLOTS.filter((s) => dayPlan[s]).length;

	return (
		<View
			className={`mb-4 p-4 rounded-3xl border ${
				isToday
					? "border-emerald-500/40 bg-emerald-500/5"
					: "border-zinc-800 bg-zinc-900/60"
			}`}
		>
			{/* Day header */}
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center gap-2">
					<Text
						className={`text-lg font-black ${isToday ? "text-emerald-400" : "text-white"}`}
					>
						{day}
					</Text>

					{isToday && (
						<View className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
							<Text className="text-xs font-bold text-emerald-400">Today</Text>
						</View>
					)}

					{mealCount > 0 && (
						<View className="px-2 py-0.5 rounded-full bg-zinc-800">
							<Text className="text-xs font-semibold text-zinc-400">
								{mealCount}/3
							</Text>
						</View>
					)}
				</View>

				{hasMeals && (
					<Pressable
						onPress={() => onClearDay(day)}
						className="px-2.5 py-1 rounded-lg bg-red-900/20 border border-red-800/30 active:scale-[0.97]"
					>
						<Text className="text-xs font-semibold text-red-400">Clear</Text>
					</Pressable>
				)}
			</View>

			{/* Meal slots */}
			<View className="flex-row gap-2">
				{MEAL_SLOTS.map((slot) => (
					<SlotCard
						key={slot}
						meal={dayPlan[slot]}
						slot={slot}
						onPress={() => onSlotPress(day, slot)}
						onRemove={() => onSlotRemove(day, slot)}
					/>
				))}
			</View>
		</View>
	);
}
