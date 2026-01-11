import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddIngredientInput } from "../components/AddIngredientInput";
import { PrimaryButton } from "../components/PrimaryButton";
import { cacheMeal } from "../services/cacheService";
import { saveCustomMeal } from "../services/customMealsService";
import { Meal } from "../types/Meal";

export function AddMealScreen() {
	const navigation = useNavigation();
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [area, setArea] = useState("");
	const [instructions, setInstructions] = useState("");
	const [thumb, setThumb] = useState("");
	const [youtube, setYoutube] = useState("");
	const [source, setSource] = useState("");
	const [ingredients, setIngredients] = useState<
		{ ingredient: string; measure: string }[]
	>([{ ingredient: "", measure: "" }]);

	const setIngredient = useCallback(
		(index: number, ingredient: string, measure: string) => {
			setIngredients((prev) => {
				const copy = [...prev];
				copy[index] = { ingredient, measure };
				return copy;
			});
		},
		[]
	);

	const addIngredient = useCallback(() => {
		setIngredients((prev) => [...prev, { ingredient: "", measure: "" }]);
	}, []);

	const removeIngredient = useCallback((index: number) => {
		setIngredients((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleSave = useCallback(async () => {
		if (!title.trim()) {
			Alert.alert("Validation", "Please enter a meal name");
			return;
		}

		const meal: Meal = {
			idMeal: `local-${Date.now()}`,
			strMeal: title,
			strCategory: category,
			strArea: area,
			strInstructions: instructions,
			strMealThumb: thumb,
			strYoutube: youtube,
			strSource: source,
			ingredients: ingredients.filter((i) => i.ingredient.trim()),
			isLocal: true,
		} as Meal;

		try {
			await saveCustomMeal(meal);
			await cacheMeal(meal);
			// navigate to meal details
			// @ts-ignore
			navigation.navigate("Meal", { meal });
		} catch (e) {
			console.error(e);
			Alert.alert("Error", "Failed to save meal");
		}
	}, [
		title,
		category,
		area,
		instructions,
		thumb,
		youtube,
		source,
		ingredients,
		navigation,
	]);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<ScrollView className="px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
				<Text className="mb-4 text-3xl font-bold text-white">Add Custom Meal</Text>

				<TextInput
					value={title}
					onChangeText={setTitle}
					placeholder="Meal name"
					placeholderTextColor="#9ca3af"
					className="px-4 py-3 mb-3 text-white rounded bg-zinc-800"
				/>

				<TextInput
					value={category}
					onChangeText={setCategory}
					placeholder="Category"
					placeholderTextColor="#9ca3af"
					className="px-4 py-3 mb-3 text-white rounded bg-zinc-800"
				/>

				<TextInput
					value={area}
					onChangeText={setArea}
					placeholder="Area (e.g., Italian)"
					placeholderTextColor="#9ca3af"
					className="px-4 py-3 mb-3 text-white rounded bg-zinc-800"
				/>

				<TextInput
					value={thumb}
					onChangeText={setThumb}
					placeholder="Thumbnail URL"
					placeholderTextColor="#9ca3af"
					className="px-4 py-3 mb-3 text-white rounded bg-zinc-800"
				/>

				<TextInput
					value={youtube}
					onChangeText={setYoutube}
					placeholder="YouTube URL"
					placeholderTextColor="#9ca3af"
					className="px-4 py-3 mb-3 text-white rounded bg-zinc-800"
				/>

				<TextInput
					value={source}
					onChangeText={setSource}
					placeholder="Source URL"
					placeholderTextColor="#9ca3af"
					className="px-4 py-3 mb-3 text-white rounded bg-zinc-800"
				/>

				<Text className="mb-2 text-xl font-bold text-white">Ingredients</Text>
				{ingredients.map((ing, i) => (
					<AddIngredientInput
						key={i}
						index={i}
						ingredient={ing.ingredient}
						measure={ing.measure}
						onChange={setIngredient}
						onRemove={removeIngredient}
					/>
				))}

				<Pressable onPress={addIngredient} className="mb-6">
					<Text className="text-emerald-400">+ Add ingredient</Text>
				</Pressable>

				<Text className="mb-2 text-xl font-bold text-white">Instructions</Text>
				<TextInput
					value={instructions}
					onChangeText={setInstructions}
					placeholder="Instructions"
					placeholderTextColor="#9ca3af"
					multiline
					className="h-40 px-4 py-3 mb-6 rounded bg-zinc-800 text-zinc-200"
				/>

				<PrimaryButton title="Save Meal" onPress={handleSave} />
				<View className="h-3" />
				<PrimaryButton
					title="Cancel"
					onPress={() => navigation.goBack()}
					variant="secondary"
				/>
			</ScrollView>
		</SafeAreaView>
	);
}
