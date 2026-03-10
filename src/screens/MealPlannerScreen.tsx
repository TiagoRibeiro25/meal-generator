import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../components";
import {
	DayCard,
	MealPickerModal,
	SLOT_LABELS,
} from "../components/MealPlanner";
import { getFavourites } from "../services/favouritesService";
import {
	DAYS_OF_WEEK,
	DayOfWeek,
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

type PickerTarget = { day: DayOfWeek; slot: MealSlot } | null;

export function MealPlannerScreen() {
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
			console.error("[MealPlannerScreen] Failed to load:", e);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load]),
	);

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

	const currentSlotMealId =
		pickerTarget && plan
			? plan[pickerTarget.day]?.[pickerTarget.slot]?.idMeal
			: undefined;

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<MealPickerModal
				visible={pickerTarget !== null}
				target={pickerTarget}
				favourites={favourites}
				currentSlotMealId={currentSlotMealId}
				onPick={handlePickMeal}
				onClose={() => setPickerTarget(null)}
			/>

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
