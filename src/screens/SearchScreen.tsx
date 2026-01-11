import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBanner } from "../components/ErrorBanner";
import { MealCard } from "../components/MealCard";
import { MealCardSkeleton } from "../components/MealCardSkeleton";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { useLoadingState } from "../hooks/useLoadingState";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { RootStackParamList } from "../navigation/StackNavigator";
import { fetchMealById, searchMealsByName } from "../services/mealService";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export function SearchScreen({ navigation }: Props) {
	const isConnected = useNetworkStatus();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Meal[]>([]);
	const [searched, setSearched] = useState(false);
	const { loading, error, execute, setError } = useLoadingState();

	const handleSearch = useCallback(async () => {
		if (!query.trim()) return;

		setSearched(true);
		const meals = await execute(() => searchMealsByName(query), "Failed to search meals");

		if (meals) {
			setResults(meals);
		} else {
			setResults([]);
		}
	}, [query, execute]);

	const handleMealPress = useCallback(
		async (id: string) => {
			const meal = await execute(() => fetchMealById(id), "Failed to load meal details");

			if (meal) {
				navigation.navigate("Meal", { meal });
			}
		},
		[navigation, execute]
	);

	const renderItem = useCallback(
		({ item }: { item: Meal }) => (
			<MealCard meal={item} onPress={() => handleMealPress(item.idMeal)} />
		),
		[handleMealPress]
	);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<View className="px-6 pt-12">
				<Text className="mb-4 text-3xl font-bold text-white">Search Meals</Text>

				<TextInput
					className="px-4 py-3 mb-4 text-white bg-zinc-800 rounded-2xl"
					placeholder="Enter meal name"
					placeholderTextColor="#a1a1aa"
					value={query}
					onChangeText={(text) => {
						setQuery(text);
						setSearched(false);
						setError(null);
					}}
					onSubmitEditing={handleSearch}
					returnKeyType="search"
				/>

				{error && <ErrorBanner message={error} />}

				{loading && (
					<View>
						{[...Array(5)].map((_, i) => (
							<MealCardSkeleton key={i} />
						))}
					</View>
				)}

				{!loading && searched && results.length === 0 && !error && (
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
		</SafeAreaView>
	);
}
