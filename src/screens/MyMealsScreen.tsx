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
			<View className="px-6 pt-6">
				<BackButton />
				<Text className="mb-4 text-3xl font-bold text-white">My Meals</Text>
			</View>

			<FlatList
				contentContainerStyle={{ padding: 24 }}
				data={meals}
				keyExtractor={(item) => item.idMeal}
				renderItem={({ item }) => (
					<View>
						<MealCard
							meal={item}
							onPress={() =>
								// @ts-ignore
								navigation.navigate("Meal", { meal: item })
							}
						/>

						<View className="flex-row items-end gap-3 mb-6">
							<Pressable
								onPress={() =>
									// @ts-ignore
									navigation.navigate("AddMeal", { meal: item })
								}
								className="px-4 py-2 bg-emerald-600 rounded-2xl"
							>
								<Text className="font-bold text-white">Edit</Text>
							</Pressable>

							<Pressable
								onPress={() => handleDelete(item.idMeal)}
								className="px-4 py-2 bg-red-600 rounded-2xl"
							>
								<Text className="font-bold text-white">Delete</Text>
							</Pressable>
						</View>
					</View>
				)}
				ListEmptyComponent={() => (
					<View className="px-6 pt-6">
						<Text className="text-zinc-400">
							You haven't created any meals yet.
						</Text>
					</View>
				)}
			/>
		</SafeAreaView>
	);
}
