import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../components";
import { getCachedMealIds } from "../services/cacheService";
import { getCollections } from "../services/collectionsService";
import { getCustomMeals } from "../services/customMealsService";
import { getFavourites } from "../services/favouritesService";
import { countPlannedMeals, getMealPlan } from "../services/mealPlanService";
import { getNoteCount } from "../services/notesService";
import { getRecentMealIds } from "../services/recentService";
import { getShoppingList } from "../services/shoppingListService";
import { getStreakData } from "../services/streakService";

type StatCardProps = {
	icon: string;
	label: string;
	value: number | string;
	accent: string;
	onPress?: () => void;
};

function StatCard({ icon, label, value, accent, onPress }: StatCardProps) {
	const inner = (
		<View
			className={`flex-1 p-4 rounded-3xl border ${accent} items-start justify-between`}
			style={{ minHeight: 110 }}
		>
			<Text className="text-3xl mb-2">{icon}</Text>
			<Text
				className="text-3xl font-black text-white"
				style={{ letterSpacing: -1 }}
			>
				{value}
			</Text>
			<Text className="text-xs font-semibold text-zinc-400 mt-0.5">
				{label}
			</Text>
		</View>
	);

	if (onPress) {
		return (
			<Pressable onPress={onPress} className="flex-1 active:scale-[0.97]">
				{inner}
			</Pressable>
		);
	}

	return <View className="flex-1">{inner}</View>;
}

type Stats = {
	favourites: number;
	customMeals: number;
	plannedMeals: number;
	shoppingItems: number;
	checkedItems: number;
	notes: number;
	recentlyViewed: number;
	cachedMeals: number;
	collections: number;
	currentStreak: number;
	longestStreak: number;
	totalCooked: number;
};

const EMPTY_STATS: Stats = {
	favourites: 0,
	customMeals: 0,
	plannedMeals: 0,
	shoppingItems: 0,
	checkedItems: 0,
	notes: 0,
	recentlyViewed: 0,
	cachedMeals: 0,
	collections: 0,
	currentStreak: 0,
	longestStreak: 0,
	totalCooked: 0,
};

export function StatsScreen() {
	const navigation = useNavigation();
	const [stats, setStats] = useState<Stats>(EMPTY_STATS);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const [
				favourites,
				customMeals,
				plan,
				shoppingList,
				noteCount,
				recentIds,
				cachedIds,
				collections,
				streakData,
			] = await Promise.all([
				getFavourites(),
				getCustomMeals(),
				getMealPlan(),
				getShoppingList(),
				getNoteCount(),
				getRecentMealIds(),
				getCachedMealIds(),
				getCollections(),
				getStreakData(),
			]);

			setStats({
				favourites: favourites.length,
				customMeals: customMeals.length,
				plannedMeals: countPlannedMeals(plan),
				shoppingItems: shoppingList.length,
				checkedItems: shoppingList.filter((i) => i.checked).length,
				notes: noteCount,
				recentlyViewed: recentIds.length,
				cachedMeals: cachedIds.length,
				collections: collections.length,
				currentStreak: streakData.currentStreak,
				longestStreak: streakData.longestStreak,
				totalCooked: streakData.totalCooked,
			});
		} catch (e) {
			console.error("Failed to load stats:", e);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load]),
	);

	const shoppingProgress =
		stats.shoppingItems > 0
			? Math.round((stats.checkedItems / stats.shoppingItems) * 100)
			: 0;

	const planProgress = Math.round((stats.plannedMeals / 21) * 100);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<View className="px-6 pt-6 pb-4">
				<BackButton />
				<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
					Overview
				</Text>
				<Text
					className="text-4xl font-black text-white"
					style={{ letterSpacing: -0.5 }}
				>
					Your Kitchen
				</Text>
			</View>

			<View className="h-px mx-6 mb-2 bg-zinc-800" />

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-zinc-500">Loading stats…</Text>
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
					{/* Top stat cards — 2 columns */}
					<Text className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
						Collection
					</Text>
					<View className="flex-row gap-3 mb-3">
						<StatCard
							icon="❤️"
							label="Favourites"
							value={stats.favourites}
							accent="border-red-800/40 bg-red-900/10"
							onPress={() => (navigation as any).navigate("Favourites")}
						/>
						<StatCard
							icon="📚"
							label="Custom Meals"
							value={stats.customMeals}
							accent="border-violet-800/40 bg-violet-900/10"
							onPress={() => (navigation as any).navigate("MyMeals")}
						/>
					</View>

					<View className="flex-row gap-3 mb-3">
						<StatCard
							icon="🕐"
							label="Recently Viewed"
							value={stats.recentlyViewed}
							accent="border-zinc-700 bg-zinc-900/60"
						/>
						<StatCard
							icon="📶"
							label="Cached Offline"
							value={stats.cachedMeals}
							accent="border-zinc-700 bg-zinc-900/60"
						/>
					</View>

					<View className="flex-row gap-3 mb-6">
						<StatCard
							icon="🗂️"
							label="Collections"
							value={stats.collections}
							accent="border-zinc-700 bg-zinc-900/60"
							onPress={() => (navigation as any).navigate("Collections")}
						/>
						<View className="flex-1" />
					</View>

					{/* Meal Planner progress */}
					<Text className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
						Meal Planner
					</Text>
					<Pressable
						onPress={() => (navigation as any).navigate("MealPlanner")}
						className="p-5 mb-6 rounded-3xl border border-emerald-800/40 bg-emerald-900/10 active:scale-[0.98]"
					>
						<View className="flex-row items-center justify-between mb-3">
							<View className="flex-row items-center gap-3">
								<Text className="text-3xl">📅</Text>
								<View>
									<Text className="text-base font-black text-white">
										This Week
									</Text>
									<Text className="text-xs text-zinc-500 mt-0.5">
										{stats.plannedMeals} of 21 slots filled
									</Text>
								</View>
							</View>
							<Text className="text-2xl font-black text-emerald-400">
								{planProgress}%
							</Text>
						</View>
						<View className="h-2 rounded-full bg-zinc-800 overflow-hidden">
							<View
								className="h-full rounded-full bg-emerald-500"
								style={{ width: `${planProgress}%` }}
							/>
						</View>
					</Pressable>

					{/* Shopping list progress */}
					<Text className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
						Shopping List
					</Text>
					<Pressable
						onPress={() => (navigation as any).navigate("ShoppingList")}
						className="p-5 mb-6 rounded-3xl border border-cyan-800/40 bg-cyan-900/10 active:scale-[0.98]"
					>
						<View className="flex-row items-center justify-between mb-3">
							<View className="flex-row items-center gap-3">
								<Text className="text-3xl">🛒</Text>
								<View>
									<Text className="text-base font-black text-white">
										Grocery List
									</Text>
									<Text className="text-xs text-zinc-500 mt-0.5">
										{stats.checkedItems} of {stats.shoppingItems} items checked
									</Text>
								</View>
							</View>
							{stats.shoppingItems > 0 ? (
								<Text className="text-2xl font-black text-cyan-400">
									{shoppingProgress}%
								</Text>
							) : (
								<Text className="text-sm font-semibold text-zinc-600">
									Empty
								</Text>
							)}
						</View>
						{stats.shoppingItems > 0 && (
							<View className="h-2 rounded-full bg-zinc-800 overflow-hidden">
								<View
									className="h-full rounded-full bg-cyan-500"
									style={{ width: `${shoppingProgress}%` }}
								/>
							</View>
						)}
					</Pressable>

					{/* Daily Challenge streak */}
					<Text className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
						Daily Challenge
					</Text>
					<Pressable
						onPress={() => (navigation as any).navigate("DailyChallenge")}
						className="p-5 mb-6 rounded-3xl border border-amber-800/40 bg-amber-900/10 active:scale-[0.98]"
					>
						<View className="flex-row items-center justify-between mb-4">
							<View className="flex-row items-center gap-3">
								<Text className="text-3xl">🔥</Text>
								<View>
									<Text className="text-base font-black text-white">
										Cooking Streak
									</Text>
									<Text className="text-xs text-zinc-500 mt-0.5">
										{stats.totalCooked} meals cooked in total
									</Text>
								</View>
							</View>
							<Text className="text-2xl font-black text-amber-400">
								{stats.currentStreak}🔥
							</Text>
						</View>
						<View className="flex-row gap-3">
							<View className="flex-1 items-center py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
								<Text className="text-lg font-black text-white">
									{stats.currentStreak}
								</Text>
								<Text className="text-xs text-zinc-500 mt-0.5">Current</Text>
							</View>
							<View className="flex-1 items-center py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
								<Text className="text-lg font-black text-white">
									{stats.longestStreak}
								</Text>
								<Text className="text-xs text-zinc-500 mt-0.5">Best</Text>
							</View>
							<View className="flex-1 items-center py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
								<Text className="text-lg font-black text-white">
									{stats.totalCooked}
								</Text>
								<Text className="text-xs text-zinc-500 mt-0.5">Total</Text>
							</View>
						</View>
					</Pressable>

					{/* Notes & misc */}
					<Text className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
						Notes
					</Text>
					<View className="flex-row gap-3 mb-6">
						<StatCard
							icon="🗒️"
							label="Meals with Notes"
							value={stats.notes}
							accent="border-amber-800/40 bg-amber-900/10"
						/>
						<View className="flex-1" />
					</View>

					{/* Empty state prompt */}
					{stats.favourites === 0 &&
						stats.customMeals === 0 &&
						stats.plannedMeals === 0 &&
						stats.currentStreak === 0 && (
							<View className="items-center px-4 py-6 rounded-3xl border border-zinc-800 bg-zinc-900/40">
								<Text className="text-4xl mb-3">🍽️</Text>
								<Text className="text-base font-bold text-center text-white mb-1">
									Nothing here yet
								</Text>
								<Text className="text-sm text-center text-zinc-500 leading-6">
									Start browsing recipes, saving favourites, and planning your
									meals to see your stats here.
								</Text>
							</View>
						)}
				</ScrollView>
			)}
		</SafeAreaView>
	);
}
