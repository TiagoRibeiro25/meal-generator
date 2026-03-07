import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddIngredientInput, BackButton, PrimaryButton } from "../components";
import { cacheMeal, persistImage, saveCustomMeal } from "../services";
import { Meal } from "../types/Meal";

type Ingredient = {
	ingredient: string;
	measure: string;
};

function SectionHeader({
	icon,
	title,
	accent,
}: {
	icon: string;
	title: string;
	accent?: string;
}) {
	return (
		<View className="flex-row items-center mb-4 mt-6">
			<View
				className={`items-center justify-center w-9 h-9 mr-3 rounded-xl ${accent ?? "bg-emerald-500/15"}`}
			>
				<Text className="text-lg">{icon}</Text>
			</View>
			<Text className="text-base font-bold text-white">{title}</Text>
			<View className="flex-1 h-px ml-4 bg-zinc-800" />
		</View>
	);
}

function FormInput({
	value,
	onChangeText,
	placeholder,
	multiline,
	numberOfLines,
}: {
	value: string;
	onChangeText: (t: string) => void;
	placeholder: string;
	multiline?: boolean;
	numberOfLines?: number;
}) {
	return (
		<TextInput
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			placeholderTextColor="#52525b"
			multiline={multiline}
			numberOfLines={numberOfLines}
			textAlignVertical={multiline ? "top" : "center"}
			className={`w-full px-4 text-base text-white border-2 border-zinc-800 bg-zinc-900 rounded-2xl mb-3 ${
				multiline ? "py-4 min-h-[140px]" : "py-4"
			}`}
		/>
	);
}

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
	const [ingredients, setIngredients] = useState<Ingredient[]>([
		{ ingredient: "", measure: "" },
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

	const isEditing = Boolean(editingMeal);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView
					contentContainerStyle={{ paddingBottom: 48 }}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<View className="px-6 pt-6 pb-2">
						<BackButton />
						<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
							{isEditing ? "Editing recipe" : "New recipe"}
						</Text>
						<Text
							className="text-4xl font-black text-white"
							style={{ letterSpacing: -0.5 }}
						>
							{isEditing ? "Edit Meal" : "Add Custom Meal"}
						</Text>
					</View>

					<View className="h-px mx-6 mt-4 mb-2 bg-zinc-800" />

					<View className="px-6">
						<SectionHeader icon="📋" title="Basic Info" />

						<FormInput
							value={title}
							onChangeText={setTitle}
							placeholder="Meal name *"
						/>
						<View className="flex-row gap-3">
							<View className="flex-1">
								<FormInput
									value={category}
									onChangeText={setCategory}
									placeholder="Category"
								/>
							</View>
							<View className="flex-1">
								<FormInput
									value={area}
									onChangeText={setArea}
									placeholder="Area (e.g. Italian)"
								/>
							</View>
						</View>

						<SectionHeader icon="📸" title="Photo" accent="bg-cyan-500/15" />

						<View className="overflow-hidden mb-3 rounded-2xl border-2 border-zinc-800">
							{thumb ? (
								<View className="relative">
									<Image
										source={{ uri: thumb }}
										className="w-full"
										style={{ height: 200 }}
										resizeMode="cover"
									/>
									<Pressable
										onPress={() => setThumb("")}
										className="absolute top-3 right-3 items-center justify-center w-8 h-8 rounded-full bg-zinc-950/80"
									>
										<Text className="text-sm font-bold text-white">✕</Text>
									</Pressable>
								</View>
							) : (
								<View className="items-center justify-center h-40 bg-zinc-900">
									<Text className="mb-2 text-4xl">🖼️</Text>
									<Text className="text-sm text-zinc-500">
										No image selected
									</Text>
								</View>
							)}
						</View>

						<View className="flex-row gap-3 mb-2">
							<Pressable
								onPress={pickImage}
								className="flex-row flex-1 items-center justify-center py-3 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-base">🖼️</Text>
								<Text className="text-sm font-bold text-cyan-400">
									Choose Photo
								</Text>
							</Pressable>
							<Pressable
								onPress={takePhoto}
								className="flex-row flex-1 items-center justify-center py-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-base">📷</Text>
								<Text className="text-sm font-bold text-emerald-400">
									Take Photo
								</Text>
							</Pressable>
						</View>

						<SectionHeader icon="🔗" title="Links" accent="bg-blue-500/15" />

						<View className="flex-row items-center px-4 border-2 border-zinc-800 bg-zinc-900 rounded-2xl mb-3">
							<Text className="mr-3 text-base">▶️</Text>
							<TextInput
								value={youtube}
								onChangeText={setYoutube}
								placeholder="YouTube URL"
								placeholderTextColor="#52525b"
								autoCapitalize="none"
								autoCorrect={false}
								keyboardType="url"
								className="flex-1 py-4 text-base text-white"
							/>
						</View>

						<View className="flex-row items-center px-4 border-2 border-zinc-800 bg-zinc-900 rounded-2xl mb-3">
							<Text className="mr-3 text-base">🌐</Text>
							<TextInput
								value={source}
								onChangeText={setSource}
								placeholder="Source URL"
								placeholderTextColor="#52525b"
								autoCapitalize="none"
								autoCorrect={false}
								keyboardType="url"
								className="flex-1 py-4 text-base text-white"
							/>
						</View>

						<SectionHeader
							icon="🥗"
							title="Ingredients"
							accent="bg-emerald-500/15"
						/>

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

						<Pressable
							onPress={addIngredient}
							className="flex-row items-center justify-center py-3 mb-2 border-2 border-dashed border-zinc-700 rounded-2xl active:border-emerald-500"
						>
							<Text className="mr-2 text-base text-emerald-400">+</Text>
							<Text className="text-sm font-semibold text-emerald-400">
								Add Ingredient
							</Text>
						</Pressable>

						<SectionHeader
							icon="📝"
							title="Instructions"
							accent="bg-violet-500/15"
						/>

						<FormInput
							value={instructions}
							onChangeText={setInstructions}
							placeholder="Describe the steps to prepare this meal…"
							multiline
						/>

						<View className="h-px my-6 bg-zinc-800" />

						<PrimaryButton
							title={isEditing ? "Update Meal" : "Save Meal"}
							onPress={handleSave}
						/>
						<View className="h-3" />
						<PrimaryButton
							title="Cancel"
							onPress={() => navigation.goBack()}
							variant="secondary"
						/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
