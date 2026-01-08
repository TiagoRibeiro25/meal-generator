import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryFilter } from "../components/CategoryFilter";
import { CategoryFilterSkeleton } from "../components/CategoryFilterSkeleton";
import { MealCard } from "../components/MealCard";
import { MealCardSkeleton } from "../components/MealCardSkeleton";
import { RootStackParamList } from "../navigation/StackNavigator";
import {
	fetchCategories,
	fetchMealById,
	fetchMealsByCategory,
} from "../services/mealService";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Filters">;

export function FilterScreen({ navigation }: Props) {
	const [categories, setCategories] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [meals, setMeals] = useState<Meal[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [loadingMeals, setLoadingMeals] = useState(false);

	// Fetch categories
	useEffect(() => {
		async function loadCategories() {
			setLoadingCategories(true);
			try {
				const cats = await fetchCategories();
				setCategories(cats);
			} catch (e) {
				console.error(e);
			} finally {
				setLoadingCategories(false);
			}
		}
		loadCategories();
	}, []);

	// Fetch meals for selected category
	useEffect(() => {
		if (!selectedCategory) {
			setMeals([]);
			return;
		}

		async function loadMeals() {
			setLoadingMeals(true);
			try {
				const fetchedMeals = await fetchMealsByCategory(selectedCategory!);
				setMeals(fetchedMeals);
			} catch (e) {
				console.error(e);
			} finally {
				setLoadingMeals(false);
			}
		}
		loadMeals();
	}, [selectedCategory]);

	// Navigate to meal screen
	const handleMealPress = useCallback(
		async (id: string) => {
			try {
				const meal = await fetchMealById(id);
				navigation.navigate("Meal", { meal });
			} catch (e) {
				console.error(e);
			}
		},
		[navigation]
	);

	// Render meal item with memoization
	const renderMealItem = useCallback(
		({ item }: { item: Meal }) => (
			<MealCard meal={item} onPress={() => handleMealPress(item.idMeal)} />
		),
		[handleMealPress]
	);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{/* Categories + title + placeholder */}
			<View className="px-6 pt-6">
				<Text className="mb-2 text-3xl font-bold text-white">Filter Meals</Text>

				{!loadingCategories && meals.length === 0 && (
					<Text className="mb-4 text-lg text-zinc-400">
						Select a category to see meals.
					</Text>
				)}

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

			{/* Meals */}
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
