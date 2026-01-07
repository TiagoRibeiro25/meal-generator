import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryFilter } from "../components/CategoryFilter";
import { MealCard } from "../components/MealCard";
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

	// Load categories
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

	// Load meals for selected category
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

	// Handle meal press
	async function handleMealPress(id: string) {
		try {
			const meal = await fetchMealById(id);
			navigation.navigate("Meal", { meal });
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: 40,
					paddingTop: 12,
				}}
				showsVerticalScrollIndicator={false}
			>
				<Text className="mb-4 text-3xl font-bold text-white">Filter Meals</Text>

				{!loadingCategories && meals.length === 0 && (
					<Text className="mb-4 text-lg text-zinc-400">
						Select a category to see meals.
					</Text>
				)}

				{loadingCategories ? (
					<ActivityIndicator size="large" color="#34D399" className="my-4" />
				) : (
					<CategoryFilter
						categories={categories}
						selectedCategory={selectedCategory}
						onSelect={setSelectedCategory}
						vertical={meals.length === 0}
					/>
				)}

				{loadingMeals && (
					<View className="items-center justify-center mt-6">
						<ActivityIndicator size="large" color="#34D399" />
					</View>
				)}

				{meals.length > 0 && (
					<FlatList
						data={meals}
						keyExtractor={(item) => item.idMeal}
						renderItem={({ item }) => (
							<MealCard meal={item} onPress={() => handleMealPress(item.idMeal)} />
						)}
						contentContainerStyle={{ paddingTop: 12 }}
						scrollEnabled={false} // Scroll handled by parent ScrollView
						showsVerticalScrollIndicator={false}
					/>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
