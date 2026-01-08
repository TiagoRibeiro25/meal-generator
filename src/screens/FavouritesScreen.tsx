import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MealCard } from "../components/MealCard";
import { MealCardSkeleton } from "../components/MealCardSkeleton";
import { RootStackParamList } from "../navigation/StackNavigator";
import { getFavourites } from "../services/favouritesService";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Favourites">;

export function FavouritesScreen({ navigation }: Props) {
	const [favourites, setFavourites] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(true);

	const loadFavourites = useCallback(async () => {
		setLoading(true);
		try {
			const meals = await getFavourites();
			setFavourites(meals);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadFavourites();
	}, [loadFavourites]);

	useEffect(() => {
		const unsubscribe = navigation.addListener("focus", () => {
			loadFavourites();
		});

		return unsubscribe;
	}, [navigation, loadFavourites]);

	const renderItem = useCallback(
		({ item }: { item: Meal }) => (
			<MealCard
				meal={item}
				onPress={() => {
					navigation.navigate("Meal", { meal: item });
				}}
			/>
		),
		[navigation]
	);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			<View className="px-6 pt-6">
				<Text className="mb-4 text-3xl font-bold text-white">My Favourites</Text>
			</View>

			{loading && (
				<View className="px-6">
					{[...Array(5)].map((_, i) => (
						<MealCardSkeleton key={i} />
					))}
				</View>
			)}

			{!loading && favourites.length === 0 && (
				<View className="items-center justify-center flex-1 px-6">
					<Text className="text-xl text-center text-zinc-400">
						No favourites yet.{"\n"}Start adding meals you love!
					</Text>
				</View>
			)}

			{!loading && favourites.length > 0 && (
				<FlatList
					data={favourites}
					keyExtractor={(item) => item.idMeal}
					renderItem={renderItem}
					contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
}
