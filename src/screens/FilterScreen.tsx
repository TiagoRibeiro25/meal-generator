import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	BackButton,
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
	useIngredients,
	useMealsByArea,
	useMealsByCategory,
	useMealsByIngredient,
	useNetworkStatus,
} from "../hooks";
import { RootStackParamList } from "../navigation/StackNavigator";
import { fetchMealById } from "../services/mealService";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Filters">;
type Tab = "category" | "area" | "ingredient";

const TAB_CONFIG: { id: Tab; icon: string; label: string }[] = [
	{ id: "category", icon: "🍽️", label: "Category" },
	{ id: "area", icon: "🌍", label: "Cuisine" },
	{ id: "ingredient", icon: "🥕", label: "Ingredient" },
];

export function FilterScreen({ navigation }: Props) {
	const isConnected = useNetworkStatus();

	const [activeTab, setActiveTab] = useState<Tab>("category");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedArea, setSelectedArea] = useState<string | null>(null);
	const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
		null,
	);
	const [mealError, setMealError] = useState<string | null>(null);

	const {
		categories,
		loading: loadingCategories,
		error: categoryError,
		reload: reloadCategories,
	} = useCategories();

	const {
		areas,
		loading: loadingAreas,
		error: areaError,
		reload: reloadAreas,
	} = useAreas();

	const {
		filteredIngredients,
		query: ingredientQuery,
		setQuery: setIngredientQuery,
		loading: loadingIngredients,
		error: ingredientListError,
	} = useIngredients(activeTab === "ingredient");

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

	const {
		meals: ingredientMeals,
		loading: loadingIngredientMeals,
		error: ingredientMealsError,
	} = useMealsByIngredient(
		activeTab === "ingredient" ? selectedIngredient : null,
	);

	const meals =
		activeTab === "category"
			? categoryMeals
			: activeTab === "area"
				? areaMeals
				: ingredientMeals;

	const loadingMeals =
		activeTab === "category"
			? loadingCategoryMeals
			: activeTab === "area"
				? loadingAreaMeals
				: loadingIngredientMeals;

	const mealsError =
		activeTab === "category"
			? categoryMealsError
			: activeTab === "area"
				? areaMealsError
				: ingredientMealsError;

	const selected =
		activeTab === "category"
			? selectedCategory
			: activeTab === "area"
				? selectedArea
				: selectedIngredient;

	const loadingItems =
		activeTab === "category" ? loadingCategories : loadingAreas;
	const items = activeTab === "category" ? categories : areas;
	const hasResults = meals.length > 0 && !loadingMeals;

	const handleTabSwitch = useCallback((tab: Tab) => {
		setActiveTab(tab);
		setMealError(null);
	}, []);

	const handleClearSelection = useCallback(() => {
		if (activeTab === "category") setSelectedCategory(null);
		else if (activeTab === "area") setSelectedArea(null);
		else setSelectedIngredient(null);
	}, [activeTab]);

	const handleMealPress = useCallback(
		async (id: string) => {
			try {
				const meal = await fetchMealById(id);
				navigation.navigate("Meal", { meal });
			} catch (e: any) {
				console.error("[FilterScreen] Failed to load meal:", e);
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

	const fatalError =
		activeTab === "category"
			? categoryError && !loadingCategories && categories.length === 0
			: activeTab === "area"
				? areaError && !loadingAreas && areas.length === 0
				: false;

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

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<View className="px-6 pt-8 pb-2 bg-zinc-950">
				<BackButton />
				<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
					Discover
				</Text>
				<Text
					className="text-4xl font-black text-white"
					style={{ letterSpacing: -0.5 }}
				>
					Browse{" "}
					<Text className="text-emerald-400">
						{activeTab === "category"
							? "Categories"
							: activeTab === "area"
								? "Cuisines"
								: "Ingredients"}
					</Text>
				</Text>

				<View className="flex-row mt-4 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
					{TAB_CONFIG.map((tab) => (
						<Pressable
							key={tab.id}
							onPress={() => handleTabSwitch(tab.id)}
							className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-1.5 active:scale-[0.98] ${
								activeTab === tab.id ? "bg-emerald-500" : ""
							}`}
						>
							<Text className="text-sm">{tab.icon}</Text>
							<Text
								className={`text-xs font-bold ${
									activeTab === tab.id ? "text-zinc-950" : "text-zinc-400"
								}`}
							>
								{tab.label}
							</Text>
						</Pressable>
					))}
				</View>

				{activeTab !== "ingredient" && selected && (
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
							onPress={handleClearSelection}
							className="ml-auto items-center justify-center w-7 h-7 rounded-full bg-zinc-800 active:bg-zinc-700"
						>
							<Text className="text-xs font-bold text-zinc-400">✕</Text>
						</Pressable>
					</View>
				)}

				{activeTab === "ingredient" && !selectedIngredient && (
					<View className="flex-row items-center mt-3 px-4 border-2 border-zinc-700 bg-zinc-900 rounded-2xl focus-within:border-emerald-500">
						<Text className="mr-2 text-base">🔍</Text>
						<TextInput
							className="flex-1 py-3 text-sm text-white"
							placeholder="Search ingredients…"
							placeholderTextColor="#52525b"
							value={ingredientQuery}
							onChangeText={setIngredientQuery}
							autoCorrect={false}
							autoCapitalize="none"
						/>
						{ingredientQuery.length > 0 && (
							<Pressable
								onPress={() => setIngredientQuery("")}
								className="items-center justify-center w-6 h-6 rounded-full bg-zinc-700 active:bg-zinc-600"
							>
								<Text className="text-xs font-bold text-zinc-300">✕</Text>
							</Pressable>
						)}
					</View>
				)}

				{activeTab === "ingredient" && selectedIngredient && (
					<View className="flex-row items-center mt-3">
						<View className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30">
							<Text className="text-sm font-semibold text-orange-400">
								🥕 {selectedIngredient}
							</Text>
						</View>
						{!loadingMeals && hasResults && (
							<Text className="ml-3 text-sm text-zinc-500">
								{meals.length} meals found
							</Text>
						)}
						<Pressable
							onPress={handleClearSelection}
							className="ml-auto items-center justify-center w-7 h-7 rounded-full bg-zinc-800 active:bg-zinc-700"
						>
							<Text className="text-xs font-bold text-zinc-400">✕</Text>
						</Pressable>
					</View>
				)}

				{activeTab !== "ingredient" && !loadingItems && !selected && (
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
			{ingredientListError && activeTab === "ingredient" && (
				<ErrorBanner message={ingredientListError} />
			)}
			{(mealError || mealsError) && (
				<ErrorBanner message={mealError || mealsError!} />
			)}

			{activeTab !== "ingredient" && (
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
			)}

			{activeTab !== "ingredient" && selected && (
				<View className="h-px mx-6 bg-zinc-800" />
			)}

			{activeTab === "ingredient" && !selectedIngredient && (
				<>
					{loadingIngredients ? (
						<View className="px-6 pt-4">
							{[...Array(6)].map((_, i) => (
								<View
									key={i}
									className="h-12 mb-2 rounded-2xl bg-zinc-800/60"
									style={{ opacity: 1 - i * 0.12 }}
								/>
							))}
						</View>
					) : (
						<FlatList
							data={filteredIngredients}
							keyExtractor={(item) => item}
							contentContainerStyle={{
								paddingHorizontal: 24,
								paddingTop: 12,
								paddingBottom: 48,
							}}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							ListEmptyComponent={() => (
								<View className="items-center justify-center py-16 px-8">
									<Text className="text-4xl mb-3">🥕</Text>
									<Text className="text-base font-bold text-center text-white mb-1">
										No ingredients found
									</Text>
									<Text className="text-sm text-center text-zinc-500">
										Try a different search term.
									</Text>
								</View>
							)}
							renderItem={({ item }) => (
								<Pressable
									onPress={() => {
										setSelectedIngredient(item);
										setIngredientQuery("");
									}}
									className="flex-row items-center px-4 py-3 mb-2 border border-zinc-800 bg-zinc-900 rounded-2xl active:scale-[0.98] active:border-orange-500/40"
								>
									<View className="items-center justify-center w-8 h-8 mr-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
										<Text className="text-base">🥕</Text>
									</View>
									<Text className="flex-1 text-sm font-semibold text-white">
										{item}
									</Text>
									<Text className="text-zinc-600 text-lg">›</Text>
								</Pressable>
							)}
						/>
					)}
				</>
			)}

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
						{activeTab === "category"
							? "category"
							: activeTab === "area"
								? "cuisine"
								: "ingredient"}
					</Text>
				</View>
			)}
		</SafeAreaView>
	);
}
