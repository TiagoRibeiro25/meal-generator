import { Pressable, Text, View } from "react-native";
import { NAV_TILES, NavTile } from "../../config/constants";

type Props = {
	onNavigate: (screen: string) => void;
};

function PrimaryTile({ tile, onPress }: { tile: NavTile; onPress: () => void }) {
	return (
		<Pressable
			onPress={onPress}
			className={`flex-1 p-5 rounded-3xl ${tile.accent} active:scale-[0.97]`}
		>
			<Text className="mb-3 text-3xl">{tile.icon}</Text>
			<Text className={`text-base font-black leading-snug ${tile.accentText}`}>
				{tile.label}
			</Text>
			<Text className="mt-1 text-xs leading-4 text-zinc-800">
				{tile.description}
			</Text>
		</Pressable>
	);
}

function SecondaryTile({
	tile,
	onPress,
}: {
	tile: NavTile;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center p-4 border-2 border-zinc-800 bg-zinc-900 rounded-2xl active:scale-[0.98]"
		>
			<View className="items-center justify-center w-12 h-12 mr-4 rounded-xl bg-zinc-800">
				<Text className="text-2xl">{tile.icon}</Text>
			</View>
			<View className="flex-1">
				<Text className="text-base font-bold text-white">{tile.label}</Text>
				<Text className="mt-0.5 text-sm text-zinc-500">{tile.description}</Text>
			</View>
			<Text className="text-lg text-zinc-600">›</Text>
		</Pressable>
	);
}

/**
 * Renders the two groups of navigation tiles on the Home screen:
 * - Primary tiles: large, colourful, side-by-side cards (Browse & Search)
 * - Secondary tiles: compact list rows for every other destination
 */
export function NavTiles({ onNavigate }: Props) {
	const primaryTiles = NAV_TILES.filter((t) => t.primary);
	const secondaryTiles = NAV_TILES.filter((t) => !t.primary);

	return (
		<>
			{/* Primary action tiles */}
			<View className="flex-row gap-4 px-6 mb-4">
				{primaryTiles.map((tile) => (
					<PrimaryTile
						key={tile.screen}
						tile={tile}
						onPress={() => onNavigate(tile.screen)}
					/>
				))}
			</View>

			{/* Secondary action tiles */}
			<View className="gap-3 px-6 mb-8">
				{secondaryTiles.map((tile) => (
					<SecondaryTile
						key={tile.screen}
						tile={tile}
						onPress={() => onNavigate(tile.screen)}
					/>
				))}
			</View>
		</>
	);
}
