import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton, MealCard } from "../components";
import {
	getCustomMeals,
	removeCustomMeal,
	removeRecentMeal,
} from "../services";
import { Meal } from "../types/Meal";

export function MyMealsScreen() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const navigation = useNavigation();

	const load = useCallback(async () => {
		const items = await getCustomMeals();
		setMeals(items);
	}, []);

	useEffect(() => {
		const unsub = navigation.addListener?.("focus", load);
		load();
		return () => unsub && unsub();
	}, [load, navigation]);

	const handleDelete = useCallback(
		(id: string) => {
			Alert.alert("Delete meal", "Delete this custom meal?", [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await removeCustomMeal(id);
							await removeRecentMeal(id);
							await load();
						} catch (e) {
							console.error(e);
							Alert.alert("Error", "Failed to delete meal");
						}
					},
				},
			]);
		},
		[load],
	);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<View className="px-6 pt-6 pb-4 bg-zinc-950">
				<BackButton />

				<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
					Your recipes
				</Text>
				<View className="flex-row items-end justify-between">
					<Text
						className="text-4xl font-black text-white"
						style={{ letterSpacing: -0.5 }}
					>
						My Meals
					</Text>
					{meals.length > 0 && (
						<View className="px-3 py-1 mb-1 rounded-full bg-zinc-800">
							<Text className="text-sm font-semibold text-zinc-400">
								{meals.length} meal{meals.length !== 1 ? "s" : ""}
							</Text>
						</View>
					)}
				</View>
			</View>

			<View className="h-px mx-6 mb-2 bg-zinc-800" />

			<FlatList
				contentContainerStyle={
					meals.length === 0
						? { flex: 1 }
						: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48 }
				}
				data={meals}
				keyExtractor={(item) => item.idMeal}
				showsVerticalScrollIndicator={false}
				renderItem={({ item }) => (
					<View className="mb-2">
						<MealCard
							meal={item}
							onPress={() =>
								// @ts-ignore
								navigation.navigate("Meal", { meal: item })
							}
						/>

						<View className="flex-row gap-3 mb-4 -mt-1 px-1">
							<Pressable
								onPress={() =>
									// @ts-ignore
									navigation.navigate("AddMeal", { meal: item })
								}
								className="flex-row flex-1 items-center justify-center py-3 bg-emerald-600/15 border border-emerald-600/30 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-sm">✏️</Text>
								<Text className="text-sm font-bold text-emerald-400">Edit</Text>
							</Pressable>

							<Pressable
								onPress={() => handleDelete(item.idMeal)}
								className="flex-row flex-1 items-center justify-center py-3 bg-red-600/15 border border-red-600/30 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-sm">🗑️</Text>
								<Text className="text-sm font-bold text-red-400">Delete</Text>
							</Pressable>
						</View>
					</View>
				)}
				ListEmptyComponent={() => (
					<View className="items-center justify-center flex-1 px-8">
						<View className="items-center justify-center w-24 h-24 mb-6 rounded-full bg-zinc-900 border-2 border-zinc-800">
							<Text className="text-5xl">📚</Text>
						</View>
						<Text className="mb-2 text-xl font-black text-center text-white">
							No custom meals yet
						</Text>
						<Text className="mb-6 text-sm leading-6 text-center text-zinc-500">
							Create your own recipes and they'll appear here. Tap{" "}
							<Text className="font-semibold text-emerald-400">
								Add Custom Meal
							</Text>{" "}
							on the home screen to get started.
						</Text>
						<Pressable
							// @ts-ignore
							onPress={() => navigation.navigate("AddMeal")}
							className="flex-row items-center justify-center px-6 py-4 bg-emerald-500 rounded-2xl active:scale-[0.97]"
						>
							<Text className="mr-2 text-lg">➕</Text>
							<Text className="text-base font-bold text-zinc-950">
								Add Custom Meal
							</Text>
						</Pressable>
					</View>
				)}
			/>
		</SafeAreaView>
	);
}
