import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	BackButton,
	ErrorBanner,
	MealCard,
	MealCardSkeleton,
	OfflineIndicator,
} from "../components";
import { useLoadingState, useNetworkStatus } from "../hooks";
import { RootStackParamList } from "../navigation/StackNavigator";
import { fetchMealById, searchMealsByName } from "../services";
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
		const meals = await execute(
			() => searchMealsByName(query),
			"Failed to search meals",
		);

		if (meals) {
			setResults(meals);
		} else {
			setResults([]);
		}
	}, [query, execute]);

	const handleMealPress = useCallback(
		async (id: string) => {
			const meal = await execute(
				() => fetchMealById(id),
				"Failed to load meal details",
			);

			if (meal) {
				navigation.navigate("Meal", { meal });
			}
		},
		[navigation, execute],
	);

	const renderItem = useCallback(
		({ item }: { item: Meal }) => (
			<MealCard meal={item} onPress={() => handleMealPress(item.idMeal)} />
		),
		[handleMealPress],
	);

	const hasResults = !loading && results.length > 0;

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<View className="px-6 pt-6 pb-4 bg-zinc-950">
				<BackButton />

				<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
					Find anything
				</Text>
				<Text
					className="mb-5 text-4xl font-black text-white"
					style={{ letterSpacing: -0.5 }}
				>
					Search <Text className="text-emerald-400">Recipes</Text>
				</Text>

				<View className="flex-row items-center px-4 border-2 border-zinc-700 bg-zinc-900 rounded-2xl focus-within:border-emerald-500">
					<Text className="mr-3 text-lg">🔍</Text>
					<TextInput
						className="flex-1 py-4 text-base text-white"
						placeholder="e.g. Pasta, Chicken, Sushi…"
						placeholderTextColor="#52525b"
						value={query}
						onChangeText={(text) => {
							setQuery(text);
							setSearched(false);
							setError(null);
							if (!text.trim()) setResults([]);
						}}
						onSubmitEditing={handleSearch}
						returnKeyType="search"
						autoCorrect={false}
						autoCapitalize="none"
					/>
					{query.length > 0 && (
						<Pressable
							onPress={() => {
								setQuery("");
								setResults([]);
								setSearched(false);
								setError(null);
							}}
							className="items-center justify-center w-7 h-7 ml-2 rounded-full bg-zinc-700 active:bg-zinc-600"
						>
							<Text className="text-xs font-bold text-zinc-300">✕</Text>
						</Pressable>
					)}
					<Pressable
						onPress={handleSearch}
						disabled={!query.trim() || loading}
						className={`ml-3 px-4 py-2 rounded-xl ${
							query.trim() && !loading
								? "bg-emerald-500 active:bg-emerald-600"
								: "bg-zinc-800"
						}`}
					>
						<Text
							className={`text-sm font-bold ${
								query.trim() && !loading ? "text-zinc-950" : "text-zinc-600"
							}`}
						>
							Search
						</Text>
					</Pressable>
				</View>

				{hasResults && (
					<Text className="mt-3 text-sm text-zinc-500">
						{results.length} result{results.length !== 1 ? "s" : ""} for{" "}
						<Text className="font-semibold text-zinc-300">"{query}"</Text>
					</Text>
				)}
			</View>

			{(hasResults || searched) && (
				<View className="h-px mx-6 mb-2 bg-zinc-800" />
			)}

			{error && <ErrorBanner message={error} />}

			{loading && (
				<View className="px-6 pt-4">
					{[...Array(4)].map((_, i) => (
						<MealCardSkeleton key={i} />
					))}
				</View>
			)}

			{!loading && searched && results.length === 0 && !error && (
				<View className="items-center justify-center flex-1 px-8">
					<View className="items-center justify-center w-24 h-24 mb-6 rounded-full bg-zinc-900 border-2 border-zinc-800">
						<Text className="text-5xl">🔍</Text>
					</View>
					<Text className="mb-2 text-xl font-black text-center text-white">
						No results found
					</Text>
					<Text className="text-sm leading-6 text-center text-zinc-500">
						We couldn't find any meals matching{" "}
						<Text className="font-semibold text-zinc-300">"{query}"</Text>.
						{"\n"}
						Try a different search term.
					</Text>
				</View>
			)}

			{!loading && !searched && results.length === 0 && !error && (
				<View className="items-center justify-center flex-1 px-8">
					<Text className="mb-4 text-6xl">🍜</Text>
					<Text className="text-base font-semibold text-center text-zinc-500">
						Type a dish name above and press{" "}
						<Text className="text-emerald-400">Search</Text>
					</Text>
				</View>
			)}

			{!loading && results.length > 0 && (
				<FlatList
					data={results}
					keyExtractor={(item) => item.idMeal}
					renderItem={renderItem}
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingTop: 8,
						paddingBottom: 48,
					}}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				/>
			)}
		</SafeAreaView>
	);
}
