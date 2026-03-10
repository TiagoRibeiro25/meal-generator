import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	HeroHeader,
	NavTiles,
	StatsBar,
	SurpriseMeButton,
} from "../components/Home";
import { OfflineIndicator, RecentlyViewed } from "../components";
import { useNetworkStatus } from "../hooks";
import { RootStackParamList } from "../navigation/StackNavigator";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
	const isConnected = useNetworkStatus();

	const handleMealFetched = useCallback(
		(meal: Meal) => {
			navigation.navigate("Meal", { meal });
		},
		[navigation],
	);

	const handleNavigate = useCallback(
		(screen: string) => {
			navigation.navigate(screen as any);
		},
		[navigation],
	);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 48 }}
				showsVerticalScrollIndicator={false}
			>
				<HeroHeader />
				<StatsBar />
				<SurpriseMeButton onMealFetched={handleMealFetched} />
				<NavTiles onNavigate={handleNavigate} />
				<RecentlyViewed />
				<View className="items-center px-6 mt-12">
					<View className="w-8 h-0.5 mb-3 rounded-full bg-zinc-800" />
					<Text className="text-xs text-zinc-600">
						Made with ❤️ by Tiago Ribeiro
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
