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
				<View className="px-6 pt-6">
					<Text className="text-4xl font-extrabold text-white">🍽️ Random Meal</Text>

					<Text className="mt-3 text-lg leading-6 text-zinc-400">
						Feeling hungry but out of ideas? Tap the button below and discover a random
						delicious meal.
					</Text>

					<View className="gap-5 mt-10">
						<PrimaryButton
							title="Browse by Category"
							onPress={() => navigation.navigate("Filters")}
						/>

						<PrimaryButton
							title="Search a Meal"
							onPress={() => navigation.navigate("Search")}
						/>

						<PrimaryButton
							title="My Favourites"
							onPress={() => navigation.navigate("Favourites")}
						/>
					</View>
				</View>

				<RecentlyViewed />
			</ScrollView>
		</SafeAreaView>
	);
}
