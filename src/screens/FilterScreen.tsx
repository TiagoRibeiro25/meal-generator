import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	CategoryFilter,
	CategoryFilterSkeleton,
	ErrorBanner,
	MealCard,
	MealCardSkeleton,
	NetworkError,
	OfflineIndicator,
} from "../components";
import { useCategories, useMealsByCategory, useNetworkStatus } from "../hooks";
import { RootStackParamList } from "../navigation/StackNavigator";
import { fetchMealById } from "../services";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Filters">;

export function FilterScreen({ navigation }: Props) {
	const isConnected = useNetworkStatus();
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [mealError, setMealError] = useState<string | null>(null);

	const {
		categories,
		loading: loadingCategories,
		error: categoryError,
		reload,
	} = useCategories();
	const {
		meals,
		loading: loadingMeals,
		error: mealsError,
	} = useMealsByCategory(selectedCategory);

	const handleMealPress = useCallback(
		async (id: string) => {
			try {
				const meal = await fetchMealById(id);
				navigation.navigate("Meal", { meal });
			} catch (e: any) {
				console.error(e);
				setMealError(e.message || "Failed to load meal details");
			}
		},
		[navigation],
	);

	const renderMealItem = useCallback(
		({ item }: { item: Meal }) => (
			<MealCard meal={item} onPress={() => handleMealPress(item.idMeal)} />
		),
		[handleMealPress],
	);

	if (categoryError && !loadingCategories && categories.length === 0) {
		return (
			<SafeAreaView className="flex-1 bg-zinc-950">
				{isConnected === false && <OfflineIndicator />}
				<NetworkError onRetry={reload} message={categoryError} />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<View className="px-6 pt-8">
				<View className="mb-6">
					<Text className="mb-2 text-4xl font-black text-white">Browse by</Text>
					<Text className="text-4xl font-black text-emerald-400">Category</Text>
				</View>

				{!loadingCategories && meals.length === 0 && (
					<Text className="mb-4 text-base text-zinc-500">
						Select a category to discover delicious meals
					</Text>
				)}

				{categoryError && <ErrorBanner message={categoryError} />}

				{loadingCategories ? (
					<CategoryFilterSkeleton vertical={meals.length === 0} />
				) : (
					<CategoryFilter
						categories={categories}
						selectedCategory={selectedCategory}
						onSelect={setSelectedCategory}
						vertical={meals.length === 0}
					/>
				)}
			</View>

			{(mealError || mealsError) && (
				<ErrorBanner message={mealError || mealsError!} />
			)}

			{loadingMeals && (
				<View className="px-6">
					{[...Array(5)].map((_, i) => (
						<MealCardSkeleton key={i} />
					))}
				</View>
			)}

			{meals.length > 0 && !loadingMeals && (
				<FlatList
					data={meals}
					keyExtractor={(item) => item.idMeal}
					renderItem={renderMealItem}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={21}
					removeClippedSubviews={true}
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingBottom: 40,
						paddingTop: 12,
					}}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
}
