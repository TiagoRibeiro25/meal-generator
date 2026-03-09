import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	BackButton,
	FullscreenImageViewer,
	IngredientsList,
	OfflineBadge,
} from "../components";
import {
	addRecentMeal,
	cacheMeal,
	isFavourite,
	isMealCached,
	removeCustomMeal,
	removeFavourite,
	removeRecentMeal,
	saveFavourite,
} from "../services";
import {
	addMealToShoppingList,
	isMealInShoppingList,
	removeMealFromShoppingList,
} from "../services/shoppingListService";
import { Meal } from "../types/Meal";
import { shareMeal } from "../utils/share";

type Props = {
	route: { params: { meal: Meal } };
};

export function MealScreen({ route }: Props) {
	const { meal } = route.params;
	const navigation = useNavigation();
	const [isFav, setIsFav] = useState(false);
	const [isCached, setIsCached] = useState(false);
	const [viewerVisible, setViewerVisible] = useState(false);
	const [inShoppingList, setInShoppingList] = useState(false);

	useEffect(() => {
		checkFavourite();
		checkCache();
		checkShoppingList();
		cacheMeal(meal);
		addRecentMeal(meal.idMeal);
	}, [meal.idMeal]);

	const checkFavourite = useCallback(async () => {
		const result = await isFavourite(meal.idMeal);
		setIsFav(result);
	}, [meal.idMeal]);

	const checkCache = useCallback(async () => {
		const cached = await isMealCached(meal.idMeal);
		setIsCached(cached);
	}, [meal.idMeal]);

	const checkShoppingList = useCallback(async () => {
		const inList = await isMealInShoppingList(meal.idMeal);
		setInShoppingList(inList);
	}, [meal.idMeal]);

	const toggleFavourite = useCallback(async () => {
		if (isFav) {
			await removeFavourite(meal.idMeal);
			setIsFav(false);
		} else {
			await saveFavourite(meal);
			setIsFav(true);
			setIsCached(true);
		}
	}, [isFav, meal]);

	const handleShare = useCallback(async () => {
		await shareMeal(meal);
	}, [meal]);

	const toggleShoppingList = useCallback(async () => {
		if (inShoppingList) {
			await removeMealFromShoppingList(meal.idMeal);
			setInShoppingList(false);
		} else {
			if (!meal.ingredients || meal.ingredients.length === 0) {
				Alert.alert(
					"No ingredients",
					"This meal has no ingredients to add to the shopping list.",
				);
				return;
			}
			await addMealToShoppingList(meal);
			setInShoppingList(true);
		}
	}, [inShoppingList, meal]);

	const handleDelete = useCallback(() => {
		Alert.alert(
			"Delete meal",
			"Are you sure you want to delete this custom meal?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await removeCustomMeal(meal.idMeal);
							await removeRecentMeal(meal.idMeal);
							navigation.goBack();
						} catch (e) {
							console.error("Failed to delete custom meal", e);
							Alert.alert("Error", "Failed to delete meal");
						}
					},
				},
			],
		);
	}, [meal.idMeal, navigation]);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<ScrollView
				contentContainerStyle={{ paddingBottom: 48 }}
				showsVerticalScrollIndicator={false}
			>
				<View className="relative">
					<Pressable onPress={() => setViewerVisible(true)}>
						<Image
							source={{ uri: meal.strMealThumb }}
							className="w-full"
							style={{ height: 320 }}
							resizeMode="cover"
						/>
					</Pressable>

					{/* Back button overlay */}
					<View className="absolute top-4 left-4">
						<BackButton />
					</View>

					{/* Tap-to-expand hint */}
					<View className="absolute bottom-4 right-4">
						<View className="px-3 py-1 rounded-full bg-zinc-950/70">
							<Text className="text-xs font-semibold text-zinc-300">
								🔍 Tap to expand
							</Text>
						</View>
					</View>
				</View>

				<FullscreenImageViewer
					visible={viewerVisible}
					uri={meal.strMealThumb}
					onClose={() => setViewerVisible(false)}
				/>

				<View className="px-5">
					<View className="pt-5 pb-4">
						<Text
							className="mb-3 text-3xl font-black leading-tight text-white"
							style={{ letterSpacing: -0.5 }}
						>
							{meal.strMeal}
						</Text>

						<View className="flex-row flex-wrap gap-2 mb-2">
							{meal.strCategory ? (
								<View className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
									<Text className="text-sm font-semibold text-emerald-400">
										{meal.strCategory}
									</Text>
								</View>
							) : null}
							{meal.strArea ? (
								<View className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30">
									<Text className="text-sm font-semibold text-cyan-400">
										🌍 {meal.strArea}
									</Text>
								</View>
							) : null}
							{meal.isLocal ? (
								<View className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30">
									<Text className="text-sm font-semibold text-violet-400">
										✏️ Custom
									</Text>
								</View>
							) : null}
						</View>

						{isCached && <OfflineBadge className="mt-1" />}
					</View>

					<View className="h-px mb-5 bg-zinc-800" />

					<Pressable
						onPress={toggleFavourite}
						className={`flex-row items-center justify-center py-4 mb-3 rounded-2xl active:scale-[0.98] ${
							isFav
								? "bg-red-500/15 border-2 border-red-500/40"
								: "bg-emerald-500 border-2 border-emerald-500"
						}`}
					>
						<Text className="mr-2 text-xl">{isFav ? "❤️" : "🤍"}</Text>
						<Text
							className={`text-base font-bold ${isFav ? "text-red-400" : "text-zinc-950"}`}
						>
							{isFav ? "Remove from Favourites" : "Add to Favourites"}
						</Text>
					</Pressable>

					<View className="flex-row gap-3 mb-3">
						<Pressable
							onPress={toggleShoppingList}
							className={`flex-row flex-1 items-center justify-center py-3 border-2 rounded-2xl active:scale-[0.98] ${
								inShoppingList
									? "bg-cyan-500/15 border-cyan-500/40"
									: "border-zinc-700 bg-zinc-900"
							}`}
						>
							<Text className="mr-2 text-lg">🛒</Text>
							<Text
								className={`text-sm font-bold ${
									inShoppingList ? "text-cyan-400" : "text-white"
								}`}
							>
								{inShoppingList ? "In Shopping List" : "Add to List"}
							</Text>
						</Pressable>

						{(meal.strSource || meal.strYoutube) && (
							<Pressable
								onPress={handleShare}
								className="flex-row flex-1 items-center justify-center py-3 border-2 border-zinc-700 rounded-2xl bg-zinc-900 active:scale-[0.98]"
							>
								<Text className="mr-2 text-lg">📤</Text>
								<Text className="text-sm font-bold text-white">Share</Text>
							</Pressable>
						)}
					</View>

					<View className="flex-row gap-3 mb-6">
						{meal.isLocal && (
							<>
								<Pressable
									onPress={() => {
										// @ts-ignore
										navigation.navigate("AddMeal", { meal });
									}}
									className="flex-row flex-1 items-center justify-center py-3 bg-emerald-600/20 border-2 border-emerald-600/40 rounded-2xl active:scale-[0.98]"
								>
									<Text className="mr-2 text-lg">✏️</Text>
									<Text className="text-sm font-bold text-emerald-400">
										Edit
									</Text>
								</Pressable>

								<Pressable
									onPress={handleDelete}
									className="flex-row flex-1 items-center justify-center py-3 bg-red-600/20 border-2 border-red-600/40 rounded-2xl active:scale-[0.98]"
								>
									<Text className="mr-2 text-lg">🗑️</Text>
									<Text className="text-sm font-bold text-red-400">Delete</Text>
								</Pressable>
							</>
						)}
					</View>

					<View className="p-5 mb-4 border border-zinc-800 bg-zinc-900 rounded-3xl">
						<View className="flex-row items-center mb-4">
							<View className="items-center justify-center w-9 h-9 mr-3 rounded-xl bg-emerald-500/15">
								<Text className="text-lg">🥗</Text>
							</View>
							<Text className="text-lg font-bold text-white">Ingredients</Text>
							<View className="ml-auto px-2 py-0.5 rounded-full bg-zinc-800">
								<Text className="text-xs font-semibold text-zinc-400">
									{meal.ingredients?.filter((i) => i.ingredient).length ?? 0}
								</Text>
							</View>
						</View>
						<IngredientsList ingredients={meal.ingredients} />
					</View>

					<View className="p-5 mb-6 border border-zinc-800 bg-zinc-900 rounded-3xl">
						<View className="flex-row items-center mb-4">
							<View className="items-center justify-center w-9 h-9 mr-3 rounded-xl bg-cyan-500/15">
								<Text className="text-lg">📝</Text>
							</View>
							<Text className="text-lg font-bold text-white">Instructions</Text>
						</View>
						<Text
							className="text-sm leading-7 text-zinc-300"
							style={{ lineHeight: 26 }}
						>
							{meal.strInstructions}
						</Text>
					</View>

					{(meal.strYoutube || meal.strSource) && (
						<View className="gap-3">
							<Text className="mb-1 text-xs font-semibold tracking-widest uppercase text-zinc-500">
								More Resources
							</Text>

							{meal.strYoutube && (
								<Pressable
									onPress={() => Linking.openURL(meal.strYoutube)}
									className="flex-row items-center py-4 px-5 bg-red-600/15 border border-red-600/30 rounded-2xl active:scale-[0.98]"
								>
									<View className="items-center justify-center w-10 h-10 mr-4 rounded-xl bg-red-600">
										<Text className="text-lg">▶️</Text>
									</View>
									<View className="flex-1">
										<Text className="text-sm font-bold text-white">
											Watch on YouTube
										</Text>
										<Text className="text-xs text-zinc-500">
											Video recipe walkthrough
										</Text>
									</View>
									<Text className="text-zinc-600">›</Text>
								</Pressable>
							)}

							{meal.strSource && (
								<Pressable
									onPress={() => Linking.openURL(meal.strSource)}
									className="flex-row items-center py-4 px-5 bg-blue-600/15 border border-blue-600/30 rounded-2xl active:scale-[0.98]"
								>
									<View className="items-center justify-center w-10 h-10 mr-4 rounded-xl bg-blue-600">
										<Text className="text-lg">🌐</Text>
									</View>
									<View className="flex-1">
										<Text className="text-sm font-bold text-white">
											View Full Recipe
										</Text>
										<Text className="text-xs text-zinc-500">
											Original source article
										</Text>
									</View>
									<Text className="text-zinc-600">›</Text>
								</Pressable>
							)}
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
