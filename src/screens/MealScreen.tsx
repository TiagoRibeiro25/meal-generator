import { useCallback, useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../components/BackButton";
import { IngredientsList } from "../components/IngredientsList";
import {
	isFavourite,
	removeFavourite,
	saveFavourite,
} from "../services/favouritesService";
import { Meal } from "../types/Meal";

type Props = {
	route: { params: { meal: Meal } };
};

export function MealScreen({ route }: Props) {
	const { meal } = route.params;
	const [isFav, setIsFav] = useState(false);

	useEffect(() => {
		checkFavourite();
	}, [meal.idMeal]);

	const checkFavourite = useCallback(async () => {
		const result = await isFavourite(meal.idMeal);
		setIsFav(result);
	}, [meal.idMeal]);

	const toggleFavourite = useCallback(async () => {
		if (isFav) {
			await removeFavourite(meal.idMeal);
			setIsFav(false);
		} else {
			await saveFavourite(meal);
			setIsFav(true);
		}
	}, [isFav, meal]);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<ScrollView className="px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
				<BackButton />

				<Image
					source={{ uri: meal.strMealThumb }}
					className="w-full h-72 rounded-2xl"
					resizeMode="cover"
				/>

				<Text className="mt-4 text-3xl font-bold text-white">{meal.strMeal}</Text>
				<Text className="mt-1 text-lg text-zinc-400">
					{meal.strCategory} • {meal.strArea}
				</Text>

				<Pressable
					onPress={toggleFavourite}
					className={`px-4 py-3 mt-4 rounded-xl ${
						isFav ? "bg-red-400" : "bg-emerald-500"
					}`}
				>
					<Text className="font-bold text-center text-white">
						{isFav ? "❤️ Remove from Favourites" : "🤍 Add to Favourites"}
					</Text>
				</Pressable>

				<IngredientsList ingredients={meal.ingredients} />

				<Text className="mt-6 mb-2 text-xl font-bold text-white">Instructions</Text>
				<Text className="leading-7 text-zinc-300">{meal.strInstructions}</Text>

				{meal.strYoutube && (
					<Pressable
						onPress={() => Linking.openURL(meal.strYoutube)}
						className="px-4 py-3 mt-6 bg-red-600 rounded-xl"
					>
						<Text className="font-bold text-center text-white">Watch on YouTube</Text>
					</Pressable>
				)}

				{meal.strSource && (
					<Pressable
						onPress={() => Linking.openURL(meal.strSource)}
						className="px-4 py-3 mt-4 bg-blue-600 rounded-xl"
					>
						<Text className="font-bold text-center text-white">View Full Recipe</Text>
					</Pressable>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
