import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { RootStackParamList } from "../navigation/StackNavigator";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
	async function handleGenerateMeal() {
		try {
			const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
			const data = await res.json();
			const apiMeal = data.meals[0];

			// Extract ingredients
			const ingredients = [];
			for (let i = 1; i <= 20; i++) {
				const ingredient = apiMeal[`strIngredient${i}`];
				const measure = apiMeal[`strMeasure${i}`];
				if (ingredient && ingredient.trim() !== "") {
					ingredients.push({ ingredient, measure });
				}
			}

			const meal: Meal = {
				idMeal: apiMeal.idMeal,
				strMeal: apiMeal.strMeal,
				strCategory: apiMeal.strCategory,
				strArea: apiMeal.strArea,
				strInstructions: apiMeal.strInstructions,
				strMealThumb: apiMeal.strMealThumb,
				strYoutube: apiMeal.strYoutube,
				strSource: apiMeal.strSource,
				ingredients,
			};

			navigation.navigate("Meal", { meal });
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<View className="justify-center flex-1 px-6 bg-zinc-950">
			<Text className="text-4xl font-extrabold text-white">🍽️ Random Meal</Text>

			<Text className="mt-3 text-lg leading-6 text-zinc-400">
				Feeling hungry but out of ideas? Tap the button below and discover a random
				delicious meal.
			</Text>

			<View className="mt-10">
				<PrimaryButton
					title="Browse by Category"
					onPress={() => navigation.navigate("Filters")}
				/>
			</View>
		</View>
	);
}
