import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { PrimaryButton } from "../components/PrimaryButton";
import { RecentlyViewed } from "../components/RecentlyViewed";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { RootStackParamList } from "../navigation/StackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
	const isConnected = useNetworkStatus();

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				<View className="px-6 pt-8">
					{/* Hero Section */}
					<View className="mb-8">
						<Text className="mb-2 text-5xl font-black text-white">🍽️</Text>
						<Text className="mb-3 text-4xl font-black text-white">Discover Your</Text>
						<Text className="mb-4 text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-emerald-400">
							Next Meal
						</Text>
						<Text className="text-base leading-6 text-zinc-400">
							Explore thousands of delicious recipes from around the world. Find your next
							favorite dish.
						</Text>
					</View>

					{/* Action Cards */}
					<View className="gap-4 mb-8">
						<PrimaryButton
							title="Browse Categories"
							icon="🔍"
							onPress={() => navigation.navigate("Filters")}
						/>

						<PrimaryButton
							title="Search Recipes"
							icon="🔎"
							onPress={() => navigation.navigate("Search")}
						/>

						<PrimaryButton
							title="My Favourites"
							icon="❤️"
							onPress={() => navigation.navigate("Favourites")}
							variant="secondary"
						/>

						<PrimaryButton
							title="My Meals"
							icon="📚"
							onPress={() => navigation.navigate("MyMeals")}
							variant="secondary"
						/>

						<PrimaryButton
							title="Add Custom Meal"
							icon="➕"
							onPress={() => navigation.navigate("AddMeal")}
							variant="secondary"
						/>
					</View>
				</View>

				<RecentlyViewed />

				{/* Footer */}
				<View className="items-center px-6 mt-12">
					<Text className="text-sm text-zinc-600">Made with ❤️ by Tiago Ribeiro</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
