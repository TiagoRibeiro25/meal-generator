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

	const hasResults = meals.length > 0 && !loadingMeals;

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<View className="px-6 pt-8 pb-4 bg-zinc-950">
				<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
					Discover
				</Text>
				<Text
					className="text-4xl font-black text-white"
					style={{ letterSpacing: -0.5 }}
				>
					Browse by <Text className="text-emerald-400">Category</Text>
				</Text>

				{!loadingCategories && !selectedCategory && (
					<Text className="mt-2 text-sm text-zinc-500">
						Tap a category to explore meals
					</Text>
				)}

				{selectedCategory && (
					<View className="flex-row items-center mt-2">
						<View className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
							<Text className="text-sm font-semibold text-emerald-400">
								{selectedCategory}
							</Text>
						</View>
						{!loadingMeals && hasResults && (
							<Text className="ml-3 text-sm text-zinc-500">
								{meals.length} meals found
							</Text>
						)}
					</View>
				)}
			</View>

			{categoryError && <ErrorBanner message={categoryError} />}
			{(mealError || mealsError) && (
				<ErrorBanner message={mealError || mealsError!} />
			)}

			<View className="bg-zinc-950">
				{loadingCategories ? (
					<CategoryFilterSkeleton vertical={!selectedCategory} />
				) : (
					<CategoryFilter
						categories={categories}
						selectedCategory={selectedCategory}
						onSelect={setSelectedCategory}
						vertical={!selectedCategory}
					/>
				)}
			</View>

			{selectedCategory && <View className="h-px mx-6 bg-zinc-800" />}

			{loadingMeals && (
				<View className="px-6 pt-4">
					{[...Array(4)].map((_, i) => (
						<MealCardSkeleton key={i} />
					))}
				</View>
			)}

			{hasResults && (
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
						paddingBottom: 48,
						paddingTop: 16,
					}}
					showsVerticalScrollIndicator={false}
				/>
			)}

			{selectedCategory &&
				!loadingMeals &&
				meals.length === 0 &&
				!mealsError && (
					<View className="items-center justify-center flex-1 px-6">
						<Text className="mb-2 text-5xl">🍽️</Text>
						<Text className="text-lg font-bold text-center text-white">
							No meals found
						</Text>
						<Text className="mt-1 text-sm text-center text-zinc-500">
							Try selecting a different category
						</Text>
					</View>
				)}
		</SafeAreaView>
	);
}
