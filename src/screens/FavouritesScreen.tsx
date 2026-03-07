import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton, MealCard, MealCardSkeleton } from "../components";
import { useFavourites } from "../hooks";
import { RootStackParamList } from "../navigation/StackNavigator";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Favourites">;

export function FavouritesScreen({ navigation }: Props) {
	const { favourites, loading, reload } = useFavourites();

	useEffect(() => {
		const unsubscribe = navigation.addListener("focus", reload);
		return unsubscribe;
	}, [navigation, reload]);

	const renderItem = useCallback(
		({ item }: { item: Meal }) => (
			<MealCard
				meal={item}
				onPress={() => {
					navigation.navigate("Meal", { meal: item });
				}}
			/>
		),
		[navigation],
	);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<View className="px-6 pt-6 pb-4 bg-zinc-950">
				<BackButton />

				<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
					Your collection
				</Text>
				<View className="flex-row items-end justify-between">
					<Text
						className="text-4xl font-black text-white"
						style={{ letterSpacing: -0.5 }}
					>
						Favourites
					</Text>
					{!loading && favourites.length > 0 && (
						<View className="px-3 py-1 mb-1 rounded-full bg-zinc-800">
							<Text className="text-sm font-semibold text-zinc-400">
								{favourites.length} saved
							</Text>
						</View>
					)}
				</View>
			</View>

			<View className="h-px mx-6 mb-2 bg-zinc-800" />

			{loading && (
				<View className="px-6 pt-4">
					{[...Array(4)].map((_, i) => (
						<MealCardSkeleton key={i} />
					))}
				</View>
			)}

			{!loading && favourites.length === 0 && (
				<View className="items-center justify-center flex-1 px-8">
					<View className="items-center justify-center w-24 h-24 mb-6 rounded-full bg-zinc-900 border-2 border-zinc-800">
						<Text className="text-5xl">🤍</Text>
					</View>
					<Text className="mb-2 text-xl font-black text-center text-white">
						No favourites yet
					</Text>
					<Text className="text-sm leading-6 text-center text-zinc-500">
						Browse categories or search for meals and tap{" "}
						<Text className="font-semibold text-emerald-400">
							Add to Favourites
						</Text>{" "}
						to save them here.
					</Text>
				</View>
			)}

			{!loading && favourites.length > 0 && (
				<FlatList
					data={favourites}
					keyExtractor={(item) => item.idMeal}
					renderItem={renderItem}
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingTop: 12,
						paddingBottom: 48,
					}}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
}
