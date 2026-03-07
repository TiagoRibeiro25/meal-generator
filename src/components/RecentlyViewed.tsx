import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { RootStackParamList } from "../navigation/StackNavigator";
import { getCachedMeal, getRecentMealIds } from "../services";
import { Meal } from "../types/Meal";
import { SkeletonLoader } from "./SkeletonLoader";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function RecentlyViewed() {
	const navigation = useNavigation<NavigationProp>();
	const [recentMeals, setRecentMeals] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(true);

	const loadRecentMeals = useCallback(async () => {
		setLoading(true);
		try {
			const recentIds = await getRecentMealIds();
			const meals = await Promise.all(recentIds.map((id) => getCachedMeal(id)));
			setRecentMeals(meals.filter((m): m is Meal => Boolean(m)));
		} catch (e) {
			console.error("Error loading recent meals:", e);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadRecentMeals();
		}, [loadRecentMeals]),
	);

	const handleMealPress = useCallback(
		(meal: Meal) => {
			navigation.navigate("Meal", { meal });
		},
		[navigation],
	);

	const renderMeal = useCallback(
		({ item }: { item: Meal }) => (
			<Pressable
				onPress={() => handleMealPress(item)}
				className="mr-3 overflow-hidden w-40 bg-zinc-900 border border-zinc-800 rounded-2xl active:scale-[0.97]"
			>
				<Image
					source={{ uri: item.strMealThumb }}
					className="w-full"
					style={{ height: 100 }}
					resizeMode="cover"
				/>
				<View className="p-3">
					<Text
						className="text-sm font-bold text-white leading-snug"
						numberOfLines={2}
					>
						{item.strMeal}
					</Text>
					{item.strCategory ? (
						<View className="self-start mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
							<Text
								className="text-xs font-semibold text-emerald-400"
								numberOfLines={1}
							>
								{item.strCategory}
							</Text>
						</View>
					) : null}
				</View>
			</Pressable>
		),
		[handleMealPress],
	);

	const renderSkeleton = useCallback(
		({ item }: { item: number }) => (
			<View className="mr-3 overflow-hidden w-40 bg-zinc-900 border border-zinc-800 rounded-2xl">
				<SkeletonLoader height={100} borderRadius={0} />
				<View className="p-3">
					<SkeletonLoader width="90%" height={14} className="mb-2" />
					<SkeletonLoader width="60%" height={10} />
				</View>
			</View>
		),
		[],
	);

	if (!loading && recentMeals.length === 0) {
		return null;
	}

	return (
		<View className="mt-2">
			<View className="flex-row items-center justify-between px-6 mb-3">
				<View className="flex-row items-center">
					<View className="w-1 h-5 mr-3 rounded-full bg-emerald-500" />
					<Text className="text-base font-black text-white">
						Recently Viewed
					</Text>
				</View>
				{!loading && recentMeals.length > 0 && (
					<View className="px-2.5 py-0.5 rounded-full bg-zinc-800">
						<Text className="text-xs font-semibold text-zinc-400">
							{recentMeals.length}
						</Text>
					</View>
				)}
			</View>

			{loading ? (
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 24 }}
					data={[1, 2, 3, 4] as number[]}
					keyExtractor={(item) => item.toString()}
					renderItem={renderSkeleton}
				/>
			) : (
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 24 }}
					data={recentMeals}
					keyExtractor={(item) => item.idMeal}
					renderItem={renderMeal}
				/>
			)}
		</View>
	);
}
