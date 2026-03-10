import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Meal } from "../../types/Meal";

type Props = {
	visible: boolean;
	favourites: Meal[];
	/** IDs of meals already in the shopping list, used to show "Added" badge */
	addedMealIds: Set<string>;
	onAdd: (meal: Meal) => void;
	onClose: () => void;
};

/**
 * Bottom-sheet modal for adding ingredients from a favourite meal to the
 * shopping list. Extracted from ShoppingListScreen to keep that file focused
 * on list management logic.
 */
export function AddFromFavouritesModal({
	visible,
	favourites,
	addedMealIds,
	onAdd,
	onClose,
}: Props) {
	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={onClose}
		>
			<SafeAreaView className="flex-1 bg-zinc-950">
				{/* Header */}
				<View className="px-6 pt-6 pb-4">
					<View className="flex-row items-center justify-between mb-1">
						<Text className="text-sm font-semibold tracking-widest uppercase text-emerald-500">
							Add ingredients
						</Text>
						<Pressable
							onPress={onClose}
							className="items-center justify-center w-9 h-9 rounded-full bg-zinc-800 active:bg-zinc-700"
						>
							<Text className="text-base font-bold text-zinc-300">✕</Text>
						</Pressable>
					</View>
					<Text
						className="text-3xl font-black text-white"
						style={{ letterSpacing: -0.5 }}
					>
						Pick a Meal
					</Text>
					<Text className="mt-1 text-sm text-zinc-500">
						Add all ingredients from a saved meal
					</Text>
				</View>

				<View className="h-px mx-6 mb-3 bg-zinc-800" />

				{favourites.length === 0 ? (
					<View className="items-center justify-center flex-1 px-8">
						<Text className="mb-3 text-5xl">🤍</Text>
						<Text className="text-base font-bold text-center text-white">
							No favourites yet
						</Text>
						<Text className="mt-1 text-sm text-center text-zinc-500">
							Save meals to your favourites first, then add their ingredients
							here.
						</Text>
					</View>
				) : (
					<FlatList
						data={favourites}
						keyExtractor={(item) => item.idMeal}
						contentContainerStyle={{
							paddingHorizontal: 24,
							paddingBottom: 48,
						}}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => {
							const isAdded = addedMealIds.has(item.idMeal);
							const ingredientCount =
								item.ingredients?.filter((i) => i.ingredient).length ?? 0;

							return (
								<Pressable
									onPress={() => onAdd(item)}
									className="flex-row items-center p-4 mb-3 border border-zinc-800 bg-zinc-900 rounded-2xl active:scale-[0.98]"
								>
									<View className="flex-1">
										<Text
											className="text-base font-bold text-white"
											numberOfLines={1}
										>
											{item.strMeal}
										</Text>
										<Text className="mt-0.5 text-xs text-zinc-500">
											{ingredientCount} ingredient
											{ingredientCount !== 1 ? "s" : ""}
											{item.strCategory ? ` · ${item.strCategory}` : ""}
										</Text>
									</View>

									{isAdded ? (
										<View className="px-3 py-1 ml-3 rounded-full bg-emerald-500/15 border border-emerald-500/30">
											<Text className="text-xs font-semibold text-emerald-400">
												✓ Added
											</Text>
										</View>
									) : (
										<View className="px-3 py-1 ml-3 rounded-full bg-zinc-700">
											<Text className="text-xs font-semibold text-zinc-300">
												+ Add
											</Text>
										</View>
									)}
								</Pressable>
							);
						}}
					/>
				)}
			</SafeAreaView>
		</Modal>
	);
}
