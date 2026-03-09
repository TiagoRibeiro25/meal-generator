import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../components";
import { fetchMealById, fetchRandomMeal } from "../services/mealService";
import {
	StreakData,
	completeChallenge,
	getStreakData,
	resetStreak,
	setDailyChallenge,
} from "../services/streakService";
import { Meal } from "../types/Meal";

function StreakBadge({ streak }: { streak: number }) {
	const color =
		streak >= 14
			? "text-amber-300"
			: streak >= 7
				? "text-orange-400"
				: streak >= 3
					? "text-emerald-400"
					: "text-zinc-400";

	const bg =
		streak >= 14
			? "bg-amber-500/15 border-amber-500/30"
			: streak >= 7
				? "bg-orange-500/15 border-orange-500/30"
				: streak >= 3
					? "bg-emerald-500/15 border-emerald-500/30"
					: "bg-zinc-800 border-zinc-700";

	return (
		<View
			className={`flex-row items-center px-3 py-1.5 rounded-full border ${bg}`}
		>
			<Text className="text-base mr-1.5">🔥</Text>
			<Text className={`text-sm font-black ${color}`}>{streak}</Text>
		</View>
	);
}

function StatPill({
	icon,
	label,
	value,
}: {
	icon: string;
	label: string;
	value: number | string;
}) {
	return (
		<View className="flex-1 items-center py-4 px-2">
			<Text className="text-xl mb-1">{icon}</Text>
			<Text className="text-xl font-black text-white">{value}</Text>
			<Text className="text-xs text-zinc-500 mt-0.5 text-center">{label}</Text>
		</View>
	);
}

export function DailyChallengeScreen() {
	const navigation = useNavigation();
	const [meal, setMeal] = useState<Meal | null>(null);
	const [streakData, setStreakData] = useState<StreakData | null>(null);
	const [loading, setLoading] = useState(true);
	const [completing, setCompleting] = useState(false);
	const [justCompleted, setJustCompleted] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const data = await getStreakData();
			setStreakData(data);

			const today = new Date().toISOString().split("T")[0];

			if (data.dailyChallengeId && data.dailyChallengeDate === today) {
				// Re-use today's challenge meal from cache
				try {
					const cached = await fetchMealById(data.dailyChallengeId);
					setMeal(cached);
				} catch {
					// Cache miss — fetch a new random meal but keep same id attempt
					const fresh = await fetchRandomMeal();
					await setDailyChallenge(fresh.idMeal);
					setMeal(fresh);
				}
			} else {
				// New day — pick a fresh random meal
				const fresh = await fetchRandomMeal();
				await setDailyChallenge(fresh.idMeal);
				setMeal(fresh);
				// Refresh streak data after setting challenge
				const updated = await getStreakData();
				setStreakData(updated);
			}

			setJustCompleted(false);
		} catch (e) {
			console.error("Error loading daily challenge:", e);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load]),
	);

	const isCompletedToday =
		streakData?.lastCompletedDate === new Date().toISOString().split("T")[0];

	const handleComplete = useCallback(async () => {
		if (!meal || isCompletedToday || completing) return;
		setCompleting(true);
		try {
			const updated = await completeChallenge();
			setStreakData(updated);
			setJustCompleted(true);
		} catch (e) {
			console.error("Error completing challenge:", e);
		} finally {
			setCompleting(false);
		}
	}, [meal, isCompletedToday, completing]);

	const handleViewMeal = useCallback(() => {
		if (!meal) return;
		// @ts-ignore
		navigation.navigate("Meal", { meal });
	}, [meal, navigation]);

	const handleResetStreak = useCallback(() => {
		Alert.alert(
			"Reset streak",
			"This will clear your entire cooking streak and history. Are you sure?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Reset",
					style: "destructive",
					onPress: async () => {
						await resetStreak();
						await load();
					},
				},
			],
		);
	}, [load]);

	const streak = streakData?.currentStreak ?? 0;
	const longest = streakData?.longestStreak ?? 0;
	const total = streakData?.totalCooked ?? 0;

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<View className="px-6 pt-6 pb-4">
				<BackButton />
				<View className="flex-row items-center justify-between mt-1">
					<View>
						<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-amber-500">
							Today's mission
						</Text>
						<Text
							className="text-4xl font-black text-white"
							style={{ letterSpacing: -0.5 }}
						>
							Daily Challenge
						</Text>
					</View>
					{streak > 0 && <StreakBadge streak={streak} />}
				</View>
			</View>

			<View className="h-px mx-6 mb-2 bg-zinc-800" />

			<ScrollView
				contentContainerStyle={{ paddingBottom: 48 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Streak stats bar */}
				<View className="flex-row mx-6 mt-3 mb-5 overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 divide-x divide-zinc-800">
					<StatPill icon="🔥" label="Current Streak" value={streak} />
					<StatPill icon="🏆" label="Best Streak" value={longest} />
					<StatPill icon="🍽️" label="Total Cooked" value={total} />
				</View>

				{loading ? (
					<View className="items-center justify-center py-24">
						<ActivityIndicator size="large" color="#f59e0b" />
						<Text className="mt-4 text-sm text-zinc-500">
							Finding today's challenge…
						</Text>
					</View>
				) : meal ? (
					<View className="px-6">
						{/* Meal card */}
						<Pressable
							onPress={handleViewMeal}
							className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 active:scale-[0.98] mb-5"
						>
							<View className="relative">
								<Image
									source={{ uri: meal.strMealThumb }}
									className="w-full"
									style={{ height: 220 }}
									resizeMode="cover"
								/>
								{/* Gradient overlay */}
								<View
									className="absolute bottom-0 left-0 right-0"
									style={{
										height: 100,
										backgroundColor: "rgba(9,9,11,0.6)",
									}}
								/>
								{/* Completed badge */}
								{(isCompletedToday || justCompleted) && (
									<View className="absolute top-3 right-3 flex-row items-center px-3 py-1.5 rounded-full bg-emerald-500 border border-emerald-400">
										<Text className="text-xs font-black text-zinc-950">
											✓ Cooked Today!
										</Text>
									</View>
								)}
								<View className="absolute bottom-4 left-4 right-4">
									<Text
										className="text-xl font-black text-white leading-snug"
										style={{ letterSpacing: -0.3 }}
										numberOfLines={2}
									>
										{meal.strMeal}
									</Text>
									<View className="flex-row flex-wrap gap-2 mt-2">
										{meal.strCategory ? (
											<View className="px-2.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-500/40">
												<Text className="text-xs font-semibold text-emerald-300">
													{meal.strCategory}
												</Text>
											</View>
										) : null}
										{meal.strArea ? (
											<View className="px-2.5 py-1 rounded-full bg-cyan-500/25 border border-cyan-500/40">
												<Text className="text-xs font-semibold text-cyan-300">
													🌍 {meal.strArea}
												</Text>
											</View>
										) : null}
									</View>
								</View>
							</View>
							<View className="flex-row items-center px-4 py-3">
								<Text className="text-xs text-zinc-500 flex-1">
									Tap to view full recipe, ingredients & instructions
								</Text>
								<Text className="text-zinc-600 text-lg">›</Text>
							</View>
						</Pressable>

						{/* Action buttons */}
						{isCompletedToday || justCompleted ? (
							<View className="items-center py-6 px-4 rounded-3xl border border-emerald-800/40 bg-emerald-900/10 mb-5">
								<Text className="text-4xl mb-3">🎉</Text>
								<Text className="text-lg font-black text-white text-center mb-1">
									Challenge Complete!
								</Text>
								<Text className="text-sm text-zinc-500 text-center leading-6 mb-4">
									{justCompleted && streak > 1
										? `You're on a ${streak}-day streak. Come back tomorrow to keep it going!`
										: justCompleted
											? "Great start! Cook again tomorrow to build your streak."
											: "You already completed today's challenge. See you tomorrow!"}
								</Text>
								<View className="flex-row items-center px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
									<Text className="text-base mr-2">🔥</Text>
									<Text className="text-sm font-bold text-emerald-400">
										{streak}-day streak
									</Text>
								</View>
							</View>
						) : (
							<>
								<Pressable
									onPress={handleComplete}
									disabled={completing}
									className="flex-row items-center justify-center py-5 mb-3 rounded-3xl bg-amber-500 border-2 border-amber-400 active:scale-[0.97]"
								>
									{completing ? (
										<ActivityIndicator
											size="small"
											color="#1c1917"
											style={{ marginRight: 10 }}
										/>
									) : (
										<Text className="mr-3 text-2xl">✅</Text>
									)}
									<View>
										<Text className="text-base font-black text-zinc-950">
											Mark as Cooked!
										</Text>
										<Text className="text-xs text-amber-800 mt-0.5">
											{streak > 0
												? `Extend your ${streak}-day streak`
												: "Start your cooking streak"}
										</Text>
									</View>
								</Pressable>

								<Pressable
									onPress={handleViewMeal}
									className="flex-row items-center justify-center py-4 mb-3 rounded-3xl border-2 border-zinc-700 bg-zinc-900 active:scale-[0.97]"
								>
									<Text className="mr-2 text-lg">📖</Text>
									<Text className="text-base font-bold text-white">
										View Full Recipe
									</Text>
								</Pressable>
							</>
						)}

						{/* Streak tips */}
						{streak === 0 && !isCompletedToday && (
							<View className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60">
								<Text className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-widest">
									How it works
								</Text>
								<View className="gap-2">
									{[
										"A new challenge meal is picked every day",
										'Tap "Mark as Cooked!" once you\'ve made it',
										"Complete challenges on consecutive days to build a streak",
										"Don't break the chain! 🔥",
									].map((tip, i) => (
										<View key={i} className="flex-row items-start gap-2">
											<Text className="text-emerald-500 font-bold text-sm mt-0.5">
												{i + 1}.
											</Text>
											<Text className="text-sm text-zinc-400 flex-1 leading-5">
												{tip}
											</Text>
										</View>
									))}
								</View>
							</View>
						)}

						{streak >= 3 && (
							<View className="flex-row items-center gap-2 mt-3 mb-1 p-4 rounded-2xl border border-amber-800/30 bg-amber-900/10">
								<Text className="text-2xl">
									{streak >= 14 ? "🏆" : streak >= 7 ? "⭐" : "🌟"}
								</Text>
								<View className="flex-1">
									<Text className="text-sm font-bold text-amber-300">
										{streak >= 14
											? "Legendary Chef!"
											: streak >= 7
												? "Dedicated Cook!"
												: "On a Roll!"}
									</Text>
									<Text className="text-xs text-zinc-500 mt-0.5">
										{streak >= 14
											? `${streak} days strong — you're unstoppable!`
											: streak >= 7
												? `${streak} days in a row — keep it up!`
												: `${streak} days — you're building a habit!`}
									</Text>
								</View>
							</View>
						)}
					</View>
				) : (
					<View className="items-center justify-center flex-1 px-8 py-24">
						<Text className="text-5xl mb-4">😕</Text>
						<Text className="text-lg font-black text-white text-center mb-2">
							Couldn't load challenge
						</Text>
						<Text className="text-sm text-zinc-500 text-center mb-6">
							Check your connection and try again.
						</Text>
						<Pressable
							onPress={load}
							className="px-6 py-3 bg-amber-500 rounded-2xl active:scale-[0.98]"
						>
							<Text className="text-sm font-bold text-zinc-950">Try Again</Text>
						</Pressable>
					</View>
				)}

				{/* Reset option tucked at the bottom */}
				{(streak > 0 || total > 0) && !loading && (
					<View className="items-center mt-6 px-6">
						<Pressable onPress={handleResetStreak} hitSlop={8}>
							<Text className="text-xs text-zinc-700">Reset streak</Text>
						</Pressable>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
