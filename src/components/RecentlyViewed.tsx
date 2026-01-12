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

			// Load cached meals
			const meals: Meal[] = [];
			for (const id of recentIds) {
				const cached = await getCachedMeal(id);
				if (cached) {
					meals.push(cached);
				}
			}

			setRecentMeals(meals);
		} catch (e) {
			console.error("Error loading recent meals:", e);
		} finally {
			setLoading(false);
		}
	}, []);

	// Refresh when screen comes into focus
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
				className="mr-4 overflow-hidden w-36 bg-zinc-900 rounded-2xl"
			>
				<Image
					source={{ uri: item.strMealThumb }}
					className="w-full h-24"
					resizeMode="cover"
				/>
				<View className="p-3">
					<Text className="text-sm font-semibold text-white" numberOfLines={2}>
						{item.strMeal}
					</Text>
					<Text className="mt-1 text-xs text-zinc-400" numberOfLines={1}>
						{item.strCategory}
					</Text>
				</View>
			</Pressable>
		),
		[handleMealPress],
	);

	const renderSkeleton = useCallback(
		() => (
			<View className="mr-4 overflow-hidden w-36 bg-zinc-900 rounded-2xl">
				<SkeletonLoader height={96} borderRadius={0} />
				<View className="p-3">
					<SkeletonLoader width="90%" height={14} className="mb-2" />
					<SkeletonLoader width="60%" height={10} />
				</View>
			</View>
		),
		[],
	);

	// Don't show section if no recent meals
	if (!loading && recentMeals.length === 0) {
		return null;
	}

	return (
		<View className="mt-8">
			<Text className="px-6 mb-3 text-xl font-bold text-white">
				Recently Viewed
			</Text>

			{loading ? (
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 24 }}
					data={[1, 2, 3, 4]}
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
