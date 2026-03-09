import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OfflineIndicator, RecentlyViewed } from "../components";
import { useNetworkStatus } from "../hooks";
import { RootStackParamList } from "../navigation/StackNavigator";
import { fetchRandomMeal } from "../services/mealService";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type NavTile = {
	icon: string;
	label: string;
	description: string;
	screen: keyof RootStackParamList;
	accent: string;
	accentText: string;
	primary?: boolean;
};

const NAV_TILES: NavTile[] = [
	{
		icon: "🔍",
		label: "Browse Categories",
		description: "Explore meals by cuisine type",
		screen: "Filters",
		accent: "bg-emerald-500",
		accentText: "text-zinc-950",
		primary: true,
	},
	{
		icon: "🔎",
		label: "Search Recipes",
		description: "Find any dish by name",
		screen: "Search",
		accent: "bg-cyan-500",
		accentText: "text-zinc-950",
		primary: true,
	},
	{
		icon: "📊",
		label: "Your Kitchen",
		description: "Stats, progress & overview",
		screen: "Stats",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "📅",
		label: "Meal Planner",
		description: "Plan your week ahead",
		screen: "MealPlanner",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "🛒",
		label: "Shopping List",
		description: "Ingredients from your meals",
		screen: "ShoppingList",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "❤️",
		label: "My Favourites",
		description: "Saved meals you love",
		screen: "Favourites",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "📚",
		label: "My Meals",
		description: "Your custom recipe collection",
		screen: "MyMeals",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "➕",
		label: "Add Custom Meal",
		description: "Create your own recipe",
		screen: "AddMeal",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
];

export function HomeScreen({ navigation }: Props) {
	const isConnected = useNetworkStatus();
	const [loadingRandom, setLoadingRandom] = useState(false);
	const [randomError, setRandomError] = useState<string | null>(null);

	const handleSurpriseMe = useCallback(async () => {
		if (loadingRandom) return;
		setRandomError(null);
		setLoadingRandom(true);
		try {
			const meal = await fetchRandomMeal();
			navigation.navigate("Meal", { meal });
		} catch (e: any) {
			setRandomError("Couldn't fetch a random meal. Check your connection.");
			console.error("Random meal error:", e);
		} finally {
			setLoadingRandom(false);
		}
	}, [loadingRandom, navigation]);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{isConnected === false && <OfflineIndicator />}

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 48 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero header */}
				<View className="px-6 pt-10 pb-8">
					<Text className="mb-1 text-sm font-semibold tracking-widest uppercase text-emerald-500">
						Welcome back
					</Text>
					<Text className="text-5xl font-black leading-tight text-white">
						What are you{"\n"}
						<Text className="text-emerald-400">cooking</Text> today?
					</Text>
					<Text className="mt-3 text-base leading-6 text-zinc-500">
						Discover thousands of recipes from around the world.
					</Text>
				</View>

				{/* Stats bar */}
				<View className="flex-row mx-6 mb-6 overflow-hidden divide-x divide-zinc-800 rounded-2xl bg-zinc-900">
					{[
						{ value: "15+", label: "Categories" },
						{ value: "100+", label: "Recipes" },
						{ value: "∞", label: "Inspiration" },
					].map((stat) => (
						<View key={stat.label} className="items-center flex-1 py-4">
							<Text className="text-2xl font-black text-emerald-400">
								{stat.value}
							</Text>
							<Text className="mt-0.5 text-xs font-medium text-zinc-500">
								{stat.label}
							</Text>
						</View>
					))}
				</View>

				{/* Surprise Me button */}
				<View className="px-6 mb-6">
					<Pressable
						onPress={handleSurpriseMe}
						disabled={loadingRandom || isConnected === false}
						className={`flex-row items-center justify-center py-5 rounded-3xl border-2 active:scale-[0.97] ${
							loadingRandom || isConnected === false
								? "border-zinc-700 bg-zinc-900 opacity-60"
								: "border-amber-500/50 bg-amber-500/10 active:bg-amber-500/20"
						}`}
					>
						{loadingRandom ? (
							<>
								<ActivityIndicator
									size="small"
									color="#f59e0b"
									style={{ marginRight: 10 }}
								/>
								<Text className="text-base font-black text-amber-400">
									Finding a meal…
								</Text>
							</>
						) : (
							<>
								<Text className="mr-3 text-3xl">🎲</Text>
								<View>
									<Text className="text-base font-black text-amber-300">
										Surprise Me!
									</Text>
									<Text className="text-xs text-amber-600 mt-0.5">
										Discover a random recipe
									</Text>
								</View>
							</>
						)}
					</Pressable>

					{randomError && (
						<View className="mt-3 px-4 py-3 rounded-2xl bg-red-900/20 border border-red-800/40">
							<Text className="text-sm text-red-400 text-center">
								{randomError}
							</Text>
						</View>
					)}
				</View>

				{/* Primary action tiles */}
				<View className="flex-row gap-4 px-6 mb-4">
					{NAV_TILES.filter((t) => t.primary).map((tile) => (
						<Pressable
							key={tile.screen}
							onPress={() => navigation.navigate(tile.screen as any)}
							className={`flex-1 p-5 rounded-3xl ${tile.accent} active:scale-[0.97]`}
						>
							<Text className="mb-3 text-3xl">{tile.icon}</Text>
							<Text
								className={`text-base font-black leading-snug ${tile.accentText}`}
							>
								{tile.label}
							</Text>
							<Text className="mt-1 text-xs leading-4 text-zinc-800">
								{tile.description}
							</Text>
						</Pressable>
					))}
				</View>

				{/* Secondary action tiles */}
				<View className="gap-3 px-6 mb-8">
					{NAV_TILES.filter((t) => !t.primary).map((tile) => (
						<Pressable
							key={tile.screen}
							onPress={() => navigation.navigate(tile.screen as any)}
							className="flex-row items-center p-4 border-2 border-zinc-800 bg-zinc-900 rounded-2xl active:scale-[0.98]"
						>
							<View className="items-center justify-center w-12 h-12 mr-4 rounded-xl bg-zinc-800">
								<Text className="text-2xl">{tile.icon}</Text>
							</View>
							<View className="flex-1">
								<Text className="text-base font-bold text-white">
									{tile.label}
								</Text>
								<Text className="mt-0.5 text-sm text-zinc-500">
									{tile.description}
								</Text>
							</View>
							<Text className="text-lg text-zinc-600">›</Text>
						</Pressable>
					))}
				</View>

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
