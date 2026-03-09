import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
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
import {
	useAreas,
	useCategories,
	useMealsByArea,
	useMealsByCategory,
	useNetworkStatus,
} from "../hooks";
import { RootStackParamList } from "../navigation/StackNavigator";
import { fetchMealById } from "../services";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Filters">;
type Tab = "category" | "area";

export function FilterScreen({ navigation }: Props) {
	const isConnected = useNetworkStatus();
	const [activeTab, setActiveTab] = useState<Tab>("category");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedArea, setSelectedArea] = useState<string | null>(null);
	const [mealError, setMealError] = useState<string | null>(null);

	// Category data
	const {
		categories,
		loading: loadingCategories,
		error: categoryError,
		reload: reloadCategories,
	} = useCategories();

	// Area data
	const {
		areas,
		loading: loadingAreas,
		error: areaError,
		reload: reloadAreas,
	} = useAreas();

	// Meals data
	const {
		meals: categoryMeals,
		loading: loadingCategoryMeals,
		error: categoryMealsError,
	} = useMealsByCategory(activeTab === "category" ? selectedCategory : null);

	const {
		meals: areaMeals,
		loading: loadingAreaMeals,
		error: areaMealsError,
	} = useMealsByArea(activeTab === "area" ? selectedArea : null);

	const meals = activeTab === "category" ? categoryMeals : areaMeals;
	const loadingMeals =
		activeTab === "category" ? loadingCategoryMeals : loadingAreaMeals;
	const mealsError =
		activeTab === "category" ? categoryMealsError : areaMealsError;
	const selected = activeTab === "category" ? selectedCategory : selectedArea;

	const handleTabSwitch = useCallback((tab: Tab) => {
		setActiveTab(tab);
		setMealError(null);
	}, []);

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

	// Full-screen network error only when we have no data at all
	const fatalError =
		activeTab === "category"
			? categoryError && !loadingCategories && categories.length === 0
			: areaError && !loadingAreas && areas.length === 0;

	if (fatalError) {
		return (
			<SafeAreaView className="flex-1 bg-zinc-950">
				{isConnected === false && <OfflineIndicator />}
				<NetworkError
					onRetry={activeTab === "category" ? reloadCategories : reloadAreas}
					message={activeTab === "category" ? categoryError! : areaError!}
				/>
			</SafeAreaView>
		);
	}

	const hasResults = meals.length > 0 && !loadingMeals;
	const loadingItems =
		activeTab === "category" ? loadingCategories : loadingAreas;
	const items = activeTab === "category" ? categories : areas;

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<View className="px-6 pt-8 pb-2 bg-zinc-950">
				<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
					Discover
				</Text>
				<Text
					className="text-4xl font-black text-white"
					style={{ letterSpacing: -0.5 }}
				>
					Browse{" "}
					<Text className="text-emerald-400">
						{activeTab === "category" ? "Categories" : "Cuisines"}
					</Text>
				</Text>

				{/* Tab switcher */}
				<View className="flex-row mt-4 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
					{(["category", "area"] as Tab[]).map((tab) => (
						<Pressable
							key={tab}
							onPress={() => handleTabSwitch(tab)}
							className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-2 active:scale-[0.98] ${
								activeTab === tab ? "bg-emerald-500" : ""
							}`}
						>
							<Text className="text-base">
								{tab === "category" ? "🍽️" : "🌍"}
							</Text>
							<Text
								className={`text-sm font-bold ${
									activeTab === tab ? "text-zinc-950" : "text-zinc-400"
								}`}
							>
								{tab === "category" ? "Category" : "Cuisine"}
							</Text>
						</Pressable>
					))}
				</View>

				{/* Selected filter badge */}
				{selected && (
					<View className="flex-row items-center mt-3">
						<View className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
							<Text className="text-sm font-semibold text-emerald-400">
								{activeTab === "area" ? "🌍 " : ""}
								{selected}
							</Text>
						</View>
						{!loadingMeals && hasResults && (
							<Text className="ml-3 text-sm text-zinc-500">
								{meals.length} meals found
							</Text>
						)}
						<Pressable
							onPress={() =>
								activeTab === "category"
									? setSelectedCategory(null)
									: setSelectedArea(null)
							}
							className="ml-auto items-center justify-center w-7 h-7 rounded-full bg-zinc-800 active:bg-zinc-700"
						>
							<Text className="text-xs font-bold text-zinc-400">✕</Text>
						</Pressable>
					</View>
				)}

				{!loadingItems && !selected && (
					<Text className="mt-2 text-sm text-zinc-500">
						{activeTab === "category"
							? "Tap a category to explore meals"
							: "Tap a cuisine to explore meals"}
					</Text>
				)}
			</View>

			{categoryError && activeTab === "category" && (
				<ErrorBanner message={categoryError} />
			)}
			{areaError && activeTab === "area" && <ErrorBanner message={areaError} />}
			{(mealError || mealsError) && (
				<ErrorBanner message={mealError || mealsError!} />
			)}

			<View className="bg-zinc-950">
				{loadingItems ? (
					<CategoryFilterSkeleton vertical={!selected} />
				) : (
					<CategoryFilter
						categories={items}
						selectedCategory={selected}
						onSelect={
							activeTab === "category" ? setSelectedCategory : setSelectedArea
						}
						vertical={!selected}
					/>
				)}
			</View>

			{selected && <View className="h-px mx-6 bg-zinc-800" />}

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

			{selected && !loadingMeals && meals.length === 0 && !mealsError && (
				<View className="items-center justify-center flex-1 px-6">
					<Text className="mb-2 text-5xl">🍽️</Text>
					<Text className="text-lg font-bold text-center text-white">
						No meals found
					</Text>
					<Text className="mt-1 text-sm text-center text-zinc-500">
						Try selecting a different{" "}
						{activeTab === "category" ? "category" : "cuisine"}
					</Text>
				</View>
			)}
		</SafeAreaView>
	);
}
