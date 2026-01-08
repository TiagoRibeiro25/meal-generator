import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryFilter } from "../components/CategoryFilter";
import { CategoryFilterSkeleton } from "../components/CategoryFilterSkeleton";
import { ErrorBanner } from "../components/ErrorBanner";
import { MealCard } from "../components/MealCard";
import { MealCardSkeleton } from "../components/MealCardSkeleton";
import { NetworkError } from "../components/NetworkError";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { RootStackParamList } from "../navigation/StackNavigator";
import {
	fetchCategories,
	fetchMealById,
	fetchMealsByCategory,
} from "../services/mealService";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Filters">;

export function FilterScreen({ navigation }: Props) {
	const isConnected = useNetworkStatus();
	const [categories, setCategories] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [meals, setMeals] = useState<Meal[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [loadingMeals, setLoadingMeals] = useState(false);
	const [categoryError, setCategoryError] = useState<string | null>(null);
	const [mealError, setMealError] = useState<string | null>(null);

	const loadCategories = useCallback(async () => {
		setLoadingCategories(true);
		setCategoryError(null);
		try {
			const cats = await fetchCategories();
			setCategories(cats);
		} catch (e: any) {
			console.error(e);
			setCategoryError(e.message || "Failed to load categories");
		} finally {
			setLoadingCategories(false);
		}
	}, []);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	useEffect(() => {
		if (!selectedCategory) {
			setMeals([]);
			setMealError(null);
			return;
		}

		async function loadMeals() {
			setLoadingMeals(true);
			setMealError(null);
			try {
				const fetchedMeals = await fetchMealsByCategory(selectedCategory!);
				setMeals(fetchedMeals);
			} catch (e: any) {
				console.error(e);
				setMealError(e.message || "Failed to load meals");
			} finally {
				setLoadingMeals(false);
			}
		}
		loadMeals();
	}, [selectedCategory]);

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
		[navigation]
	);

	const renderMealItem = useCallback(
		({ item }: { item: Meal }) => (
			<MealCard meal={item} onPress={() => handleMealPress(item.idMeal)} />
		),
		[handleMealPress]
	);

	if (categoryError && !loadingCategories && categories.length === 0) {
		return (
			<SafeAreaView className="flex-1 bg-zinc-950">
				{isConnected === false && <OfflineIndicator />}
				<NetworkError onRetry={loadCategories} message={categoryError} />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<View className="px-6 pt-6">
				<Text className="mb-2 text-3xl font-bold text-white">Filter Meals</Text>

				{!loadingCategories && meals.length === 0 && (
					<Text className="mb-4 text-lg text-zinc-400">
						Select a category to see meals.
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

			{mealError && <ErrorBanner message={mealError} />}

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
