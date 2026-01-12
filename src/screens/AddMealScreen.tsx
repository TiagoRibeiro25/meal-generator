import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddIngredientInput, PrimaryButton } from "../components";
import { cacheMeal, persistImage, saveCustomMeal } from "../services";
import { Meal } from "../types/Meal";

export function AddMealScreen() {
	const navigation = useNavigation();
	const route = useRoute();
	const editingMeal = (route.params as any)?.meal as Meal | undefined;
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
		[],
	);

	const addIngredient = useCallback(() => {
		setIngredients((prev) => [...prev, { ingredient: "", measure: "" }]);
	}, []);

	const removeIngredient = useCallback((index: number) => {
		setIngredients((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const pickImage = useCallback(async () => {
		try {
			const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (perm.status !== "granted") {
				Alert.alert(
					"Permission required",
					"Permission to access photos is required.",
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: "images",
				allowsEditing: true,
				quality: 0.8,
			});

			const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri;
			if (uri) setThumb(uri);
		} catch (e) {
			console.error("Image pick error", e);
		}
	}, []);

	const takePhoto = useCallback(async () => {
		try {
			const perm = await ImagePicker.requestCameraPermissionsAsync();
			if (perm.status !== "granted") {
				Alert.alert(
					"Permission required",
					"Permission to access camera is required.",
				);
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				allowsEditing: true,
				quality: 0.8,
			});

			const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri;
			if (uri) setThumb(uri);
		} catch (e) {
			console.error("Camera error", e);
		}
	}, []);

	const handleSave = useCallback(async () => {
		if (!title.trim()) {
			Alert.alert("Validation", "Please enter a meal name");
			return;
		}

		const id = editingMeal ? editingMeal.idMeal : `local-${Date.now()}`;

		// Persist picked image into app storage (delegated to imageService)
		const finalThumb = await persistImage(thumb, id);

		const meal: Meal = {
			idMeal: id,
			strMeal: title,
			strCategory: category,
			strArea: area,
			strInstructions: instructions,
			strMealThumb: finalThumb,
			strYoutube: youtube,
			strSource: source,
			ingredients: ingredients.filter((i) => i.ingredient.trim()),
			isLocal: true,
		} as Meal;

		try {
			await saveCustomMeal(meal);
			await cacheMeal(meal);
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
		editingMeal,
	]);

	useEffect(() => {
		if (!editingMeal) return;
		setTitle(editingMeal.strMeal || "");
		setCategory(editingMeal.strCategory || "");
		setArea(editingMeal.strArea || "");
		setInstructions(editingMeal.strInstructions || "");
		setThumb(editingMeal.strMealThumb || "");
		setYoutube(editingMeal.strYoutube || "");
		setSource(editingMeal.strSource || "");
		setIngredients(
			editingMeal.ingredients?.length
				? editingMeal.ingredients
				: [{ ingredient: "", measure: "" }],
		);
	}, [editingMeal]);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<ScrollView
				className="px-6 pt-6"
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				<Text className="mb-4 text-3xl font-bold text-white">
					{editingMeal ? "Edit Custom Meal" : "Add Custom Meal"}
				</Text>

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

				<View className="mb-3">
					{thumb ? (
						<Image
							source={{ uri: thumb }}
							className="w-full h-48 mb-3 rounded"
							resizeMode="cover"
						/>
					) : (
						<View className="items-center justify-center w-full h-48 mb-3 rounded bg-zinc-800">
							<Text className="text-zinc-500">No image selected</Text>
						</View>
					)}

					<View className="flex-row gap-3">
						<Pressable
							onPress={pickImage}
							className="px-4 py-3 rounded bg-emerald-600"
						>
							<Text className="text-white">Choose Photo</Text>
						</Pressable>
						<Pressable
							onPress={takePhoto}
							className="px-4 py-3 rounded bg-cyan-600"
						>
							<Text className="text-white">Take Photo</Text>
						</Pressable>
					</View>
				</View>

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

				<PrimaryButton
					title={editingMeal ? "Update Meal" : "Save Meal"}
					onPress={handleSave}
				/>
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
