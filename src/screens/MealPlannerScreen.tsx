import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
	Alert,
	FlatList,
	Image,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../components";
import { getFavourites } from "../services/favouritesService";
import {
	DAYS_OF_WEEK,
	DayOfWeek,
	DayPlan,
	MEAL_SLOTS,
	MealSlot,
	WeeklyMealPlan,
	clearDayPlan,
	clearMealPlan,
	countPlannedMeals,
	getMealPlan,
	removeMealFromSlot,
	setMealForSlot,
} from "../services/mealPlanService";
import { Meal } from "../types/Meal";

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

type PickerTarget = { day: DayOfWeek; slot: MealSlot } | null;

function SlotCard({
	meal,
	slot,
	onPress,
	onRemove,
}: {
	meal?: Meal;
	slot: MealSlot;
	onPress: () => void;
	onRemove: () => void;
}) {
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

function DayCard({
	day,
	dayPlan,
	isToday,
	onSlotPress,
	onSlotRemove,
	onClearDay,
}: {
	day: DayOfWeek;
	dayPlan: DayPlan;
	isToday: boolean;
	onSlotPress: (day: DayOfWeek, slot: MealSlot) => void;
	onSlotRemove: (day: DayOfWeek, slot: MealSlot) => void;
	onClearDay: (day: DayOfWeek) => void;
}) {
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

			{/* Slots */}
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

export function MealPlannerScreen() {
	const navigation = useNavigation();
	const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
	const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
	const [favourites, setFavourites] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const [weekPlan, favs] = await Promise.all([
				getMealPlan(),
				getFavourites(),
			]);
			setPlan(weekPlan);
			setFavourites(favs);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load]),
	);

	// Determine today's day name
	const todayName = new Intl.DateTimeFormat("en-US", {
		weekday: "long",
	}).format(new Date()) as DayOfWeek;

	const handleSlotPress = useCallback((day: DayOfWeek, slot: MealSlot) => {
		setPickerTarget({ day, slot });
	}, []);

	const handlePickMeal = useCallback(
		async (meal: Meal) => {
			if (!pickerTarget) return;
			const { day, slot } = pickerTarget;
			await setMealForSlot(day, slot, meal);
			setPickerTarget(null);
			await load();
		},
		[pickerTarget, load],
	);

	const handleSlotRemove = useCallback(
		async (day: DayOfWeek, slot: MealSlot) => {
			await removeMealFromSlot(day, slot);
			await load();
		},
		[load],
	);

	const handleClearDay = useCallback(
		(day: DayOfWeek) => {
			Alert.alert("Clear day", `Remove all meals from ${day}?`, [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear",
					style: "destructive",
					onPress: async () => {
						await clearDayPlan(day);
						await load();
					},
				},
			]);
		},
		[load],
	);

	const handleClearAll = useCallback(() => {
		Alert.alert("Clear week", "Remove all meals from this week's plan?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Clear all",
				style: "destructive",
				onPress: async () => {
					await clearMealPlan();
					await load();
				},
			},
		]);
	}, [load]);

	const totalPlanned = plan ? countPlannedMeals(plan) : 0;

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{/* Meal Picker Modal */}
			<Modal
				visible={pickerTarget !== null}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setPickerTarget(null)}
			>
				<SafeAreaView className="flex-1 bg-zinc-950">
					<View className="px-6 pt-6 pb-4">
						<View className="flex-row items-center justify-between mb-1">
							<Text className="text-sm font-semibold tracking-widest uppercase text-emerald-500">
								{pickerTarget ? SLOT_LABELS[pickerTarget.slot].icon : ""}{" "}
								{pickerTarget ? SLOT_LABELS[pickerTarget.slot].label : ""} ·{" "}
								{pickerTarget ? DAY_ABBREVIATIONS[pickerTarget.day] : ""}
							</Text>
							<Pressable
								onPress={() => setPickerTarget(null)}
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
								Save meals to your favourites first, then assign them to your
								meal plan.
							</Text>
							<Pressable
								onPress={() => setPickerTarget(null)}
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
								const alreadyAssigned =
									pickerTarget !== null &&
									plan?.[pickerTarget.day]?.[pickerTarget.slot]?.idMeal ===
										item.idMeal;
								return (
									<Pressable
										onPress={() => handlePickMeal(item)}
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
										{alreadyAssigned ? (
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

			{/* Main content */}
			<View className="px-6 pt-6 pb-4 bg-zinc-950">
				<BackButton />

				<View className="flex-row items-end justify-between mt-1">
					<View>
						<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
							This week
						</Text>
						<Text
							className="text-4xl font-black text-white"
							style={{ letterSpacing: -0.5 }}
						>
							Meal Planner
						</Text>
					</View>

					<View className="items-end mb-1 gap-2">
						{totalPlanned > 0 && (
							<View className="px-3 py-1 rounded-full bg-zinc-800">
								<Text className="text-sm font-semibold text-zinc-400">
									{totalPlanned} planned
								</Text>
							</View>
						)}
						{totalPlanned > 0 && (
							<Pressable
								onPress={handleClearAll}
								className="px-3 py-1 rounded-full bg-red-900/20 border border-red-800/30 active:scale-[0.97]"
							>
								<Text className="text-xs font-semibold text-red-400">
									Clear week
								</Text>
							</Pressable>
						)}
					</View>
				</View>

				{/* Legend */}
				<View className="flex-row gap-4 mt-3">
					{MEAL_SLOTS.map((slot) => (
						<View key={slot} className="flex-row items-center gap-1">
							<Text className="text-xs">{SLOT_LABELS[slot].icon}</Text>
							<Text className="text-xs text-zinc-500">
								{SLOT_LABELS[slot].label}
							</Text>
						</View>
					))}
				</View>
			</View>

			<View className="h-px mx-6 mb-2 bg-zinc-800" />

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-zinc-500">Loading planner…</Text>
				</View>
			) : (
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingTop: 12,
						paddingBottom: 48,
					}}
					showsVerticalScrollIndicator={false}
				>
					{DAYS_OF_WEEK.map((day) => (
						<DayCard
							key={day}
							day={day}
							dayPlan={plan?.[day] ?? {}}
							isToday={day === todayName}
							onSlotPress={handleSlotPress}
							onSlotRemove={handleSlotRemove}
							onClearDay={handleClearDay}
						/>
					))}

					{totalPlanned === 0 && (
						<View className="items-center mt-4 px-4 py-6 rounded-3xl border border-zinc-800 bg-zinc-900/40">
							<Text className="text-4xl mb-3">📅</Text>
							<Text className="text-base font-bold text-center text-white mb-1">
								Plan your week
							</Text>
							<Text className="text-sm text-center text-zinc-500 leading-6">
								Tap any{" "}
								<Text className="text-emerald-400 font-semibold">+</Text> slot
								to assign a meal from your favourites.
							</Text>
						</View>
					)}
				</ScrollView>
			)}
		</SafeAreaView>
	);
}
