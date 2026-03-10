import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DayOfWeek, MealSlot } from "../../services/mealPlanService";
import { Meal } from "../../types/Meal";

const SLOT_LABELS: Record<MealSlot, { icon: string; label: string }> = {
	breakfast: { icon: "🌅", label: "Breakfast" },
	lunch: { icon: "☀️", label: "Lunch" },
	dinner: { icon: "🌙", label: "Dinner" },
};

const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
	Monday: "Mon",
	Tuesday: "Tue",
	Wednesday: "Wed",
	Thursday: "Thu",
	Friday: "Fri",
	Saturday: "Sat",
	Sunday: "Sun",
};

type PickerTarget = { day: DayOfWeek; slot: MealSlot };

type Props = {
	visible: boolean;
	target: PickerTarget | null;
	favourites: Meal[];
	/** The full week plan, used to highlight already-assigned meals */
	currentSlotMealId?: string;
	onPick: (meal: Meal) => void;
	onClose: () => void;
};

/**
 * Bottom-sheet modal for picking a meal to assign to a planner slot.
 * Lists the user's favourites and highlights the currently assigned meal.
 */
export function MealPickerModal({
	visible,
	target,
	favourites,
	currentSlotMealId,
	onPick,
	onClose,
}: Props) {
	const slotLabel = target ? SLOT_LABELS[target.slot] : null;
	const dayAbbr = target ? DAY_ABBREVIATIONS[target.day] : "";

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={onClose}
		>
			<SafeAreaView className="flex-1 bg-zinc-950">
				{/* Header */}
				<View className="px-6 pt-6 pb-4">
					<View className="flex-row items-center justify-between mb-1">
						<Text className="text-sm font-semibold tracking-widest uppercase text-emerald-500">
							{slotLabel ? `${slotLabel.icon} ${slotLabel.label}` : ""}{" "}
							{dayAbbr ? `· ${dayAbbr}` : ""}
						</Text>
						<Pressable
							onPress={onClose}
							className="items-center justify-center w-9 h-9 rounded-full bg-zinc-800 active:bg-zinc-700"
						>
							<Text className="text-base font-bold text-zinc-300">✕</Text>
						</Pressable>
					</View>
					<Text
						className="text-3xl font-black text-white"
						style={{ letterSpacing: -0.5 }}
					>
						Choose a Meal
					</Text>
					<Text className="mt-1 text-sm text-zinc-500">
						Pick from your favourites
					</Text>
				</View>

				<View className="h-px mx-6 mb-3 bg-zinc-800" />

				{favourites.length === 0 ? (
					<View className="items-center justify-center flex-1 px-8">
						<Text className="mb-3 text-5xl">🤍</Text>
						<Text className="text-base font-bold text-center text-white">
							No favourites yet
						</Text>
						<Text className="mt-1 text-sm text-center text-zinc-500">
							Save meals to your favourites first, then assign them to your meal
							plan.
						</Text>
						<Pressable
							onPress={onClose}
							className="mt-6 px-6 py-3 bg-zinc-800 rounded-2xl active:scale-[0.98]"
						>
							<Text className="text-sm font-bold text-white">Dismiss</Text>
						</Pressable>
					</View>
				) : (
					<FlatList
						data={favourites}
						keyExtractor={(item) => item.idMeal}
						contentContainerStyle={{
							paddingHorizontal: 24,
							paddingBottom: 48,
						}}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => {
							const isSelected = currentSlotMealId === item.idMeal;

							return (
								<Pressable
									onPress={() => onPick(item)}
									className="flex-row items-center p-3 mb-3 border border-zinc-800 bg-zinc-900 rounded-2xl active:scale-[0.98]"
								>
									{item.strMealThumb ? (
										<Image
											source={{ uri: item.strMealThumb }}
											className="rounded-xl mr-3 flex-shrink-0"
											style={{ width: 56, height: 56 }}
											resizeMode="cover"
										/>
									) : (
										<View className="w-14 h-14 rounded-xl mr-3 bg-zinc-800 items-center justify-center flex-shrink-0">
											<Text className="text-2xl">🍽️</Text>
										</View>
									)}

									<View className="flex-1">
										<Text
											className="text-base font-bold text-white"
											numberOfLines={1}
										>
											{item.strMeal}
										</Text>
										<Text className="mt-0.5 text-xs text-zinc-500">
											{[item.strCategory, item.strArea]
												.filter(Boolean)
												.join(" · ")}
										</Text>
									</View>

									{isSelected ? (
										<View className="px-3 py-1 ml-3 rounded-full bg-emerald-500/15 border border-emerald-500/30">
											<Text className="text-xs font-semibold text-emerald-400">
												✓ Selected
											</Text>
										</View>
									) : (
										<View className="px-3 py-1 ml-3 rounded-full bg-zinc-700">
											<Text className="text-xs font-semibold text-zinc-300">
												Pick
											</Text>
										</View>
									)}
								</Pressable>
							);
						}}
					/>
				)}
			</SafeAreaView>
		</Modal>
	);
}
