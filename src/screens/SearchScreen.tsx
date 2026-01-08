import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { MealCard } from "../components/MealCard";
import { MealCardSkeleton } from "../components/MealCardSkeleton";
import { RootStackParamList } from "../navigation/StackNavigator";
import { fetchMealById, searchMealsByName } from "../services/mealService";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export function SearchScreen({ navigation }: Props) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);

	const handleSearch = useCallback(async () => {
		if (!query.trim()) return;

		setLoading(true);
		setSearched(true);

		try {
			const meals = await searchMealsByName(query);
			setResults(meals);
		} catch (e) {
			console.error(e);
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, [query]);

	const renderItem = useCallback(
		({ item }: { item: Meal }) => (
			<MealCard
				meal={item}
				onPress={async () => {
					const fullMeal = await fetchMealById(item.idMeal);
					navigation.navigate("Meal", { meal: fullMeal });
				}}
			/>
		),
		[navigation]
	);

	return (
		<View className="flex-1 px-6 pt-12 bg-zinc-950">
			<Text className="mb-4 text-3xl font-bold text-white">Search Meals</Text>

			<TextInput
				className="px-4 py-3 mb-4 text-white bg-zinc-800 rounded-2xl"
				placeholder="Enter meal name"
				placeholderTextColor="#a1a1aa"
				value={query}
				onChangeText={(text) => {
					setQuery(text);
					setSearched(false);
				}}
				onSubmitEditing={handleSearch}
				returnKeyType="search"
			/>

			{loading && (
				<View>
					{[...Array(5)].map((_, i) => (
						<MealCardSkeleton key={i} />
					))}
				</View>
			)}

			{!loading && searched && results.length === 0 && (
				<Text className="mt-6 text-lg text-center text-zinc-400">
					No meals found for "{query}"
				</Text>
			)}

			{!loading && (
				<FlatList
					data={results}
					keyExtractor={(item) => item.idMeal}
					renderItem={renderItem}
					contentContainerStyle={{ paddingBottom: 40 }}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</View>
	);
}
