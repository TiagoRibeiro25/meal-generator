import { Text, View } from "react-native";

/**
 * The top hero section of the Home screen — greeting, title and subtitle.
 * Pure presentational component with no props needed.
 */
export function HeroHeader() {
	return (
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
	);
}
