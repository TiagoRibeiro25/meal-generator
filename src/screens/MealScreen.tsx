import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton, FullscreenImageViewer, IngredientsList, OfflineBadge } from "../components";
import { addRecentMeal, cacheMeal, isFavourite, isMealCached, removeCustomMeal, removeFavourite, removeRecentMeal, saveFavourite } from "../services";
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

	useEffect(() => {
		checkFavourite();
		checkCache();
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

	const handleDelete = useCallback(() => {
		Alert.alert("Delete meal", "Are you sure you want to delete this custom meal?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await removeCustomMeal(meal.idMeal);
						await removeRecentMeal(meal.idMeal);
						// go back after deletion
						// @ts-ignore
						navigation.goBack();
					} catch (e) {
						console.error("Failed to delete custom meal", e);
						Alert.alert("Error", "Failed to delete meal");
					}
				},
			},
		]);
	}, [meal.idMeal, navigation]);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<ScrollView className="px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
				<BackButton />

				{/* Hero Image */}
				<View className="relative mb-6 overflow-hidden shadow-2xl rounded-3xl">
					<Pressable onPress={() => setViewerVisible(true)}>
						<Image
							source={{ uri: meal.strMealThumb }}
							className="w-full h-80"
							resizeMode="cover"
						/>
						<View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
					</Pressable>
				</View>

				<FullscreenImageViewer
					visible={viewerVisible}
					uri={meal.strMealThumb}
					onClose={() => setViewerVisible(false)}
				/>

				{/* Title Section */}
				<View className="mb-6">
					<Text className="mb-3 text-4xl font-black leading-tight text-white">
						{meal.strMeal}
					</Text>

					<View className="flex-row flex-wrap gap-2 mb-3">
						<View className="px-4 py-2 rounded-full bg-emerald-500/20">
							<Text className="text-base font-bold text-emerald-400">
								{meal.strCategory}
							</Text>
						</View>
						<View className="px-4 py-2 rounded-full bg-cyan-500/20">
							<Text className="text-base font-bold text-cyan-400">{meal.strArea}</Text>
						</View>
					</View>

					{isCached && <OfflineBadge />}
				</View>

				{/* Action Buttons */}
				<View className="gap-3 mb-8">
					<Pressable
						onPress={toggleFavourite}
						className={`px-6 py-4 rounded-2xl flex-row items-center justify-center active:scale-[0.98] ${
							isFav ? "bg-red-500" : "bg-emerald-500"
						}`}
					>
						<Text className="mr-2 text-2xl">{isFav ? "❤️" : "🤍"}</Text>
						<Text className="text-lg font-bold text-white">
							{isFav ? "Remove from Favourites" : "Add to Favourites"}
						</Text>
					</Pressable>

					{(meal.strSource || meal.strYoutube) && (
						<Pressable
							onPress={handleShare}
							className="flex-row items-center justify-center px-6 py-4 border-2 border-zinc-700 rounded-2xl bg-zinc-800 active:scale-[0.98]"
						>
							<Text className="mr-2 text-xl">📤</Text>
							<Text className="text-lg font-bold text-white">Share Recipe</Text>
						</Pressable>
					)}

					{meal.isLocal && (
						<View className="flex-row gap-3">
							<Pressable
								onPress={() => {
									// @ts-ignore
									navigation.navigate("AddMeal", { meal });
								}}
								className="flex-row items-center justify-center px-6 py-4 bg-emerald-600 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-xl">✏️</Text>
								<Text className="text-lg font-bold text-white">Edit Meal</Text>
							</Pressable>

							<Pressable
								onPress={handleDelete}
								className="flex-row items-center justify-center px-6 py-4 bg-red-600 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-xl">🗑️</Text>
								<Text className="text-lg font-bold text-white">Delete Meal</Text>
							</Pressable>
						</View>
					)}
				</View>

				<IngredientsList ingredients={meal.ingredients} />

				{/* Instructions Section */}
				<View className="p-6 my-6 border-2 border-zinc-800 bg-zinc-900/50 rounded-3xl">
					<Text className="mb-4 text-2xl font-bold text-white">📝 Instructions</Text>
					<Text className="text-base leading-7 text-zinc-300">
						{meal.strInstructions}
					</Text>
				</View>

				{/* External Links */}
				<View className="gap-3">
					{meal.strYoutube && (
						<Pressable
							onPress={() => Linking.openURL(meal.strYoutube)}
							className="flex-row items-center justify-center px-6 py-4 bg-red-600 rounded-2xl active:scale-[0.98]"
						>
							<Text className="mr-2 text-xl">▶️</Text>
							<Text className="text-lg font-bold text-white">Watch on YouTube</Text>
						</Pressable>
					)}

					{meal.strSource && (
						<Pressable
							onPress={() => Linking.openURL(meal.strSource)}
							className="flex-row items-center justify-center px-6 py-4 bg-blue-600 rounded-2xl active:scale-[0.98]"
						>
							<Text className="mr-2 text-xl">🌐</Text>
							<Text className="text-lg font-bold text-white">View Full Recipe</Text>
						</Pressable>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
