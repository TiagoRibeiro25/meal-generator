import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
	Alert,
	FlatList,
	Modal,
	Pressable,
	SectionList,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../components";
import {
	ShoppingListItem,
	clearCheckedItems,
	clearShoppingList,
	getShoppingList,
	groupByMeal,
	removeMealFromShoppingList,
	removeShoppingItem,
	toggleShoppingItem,
} from "../services/shoppingListService";
import { getFavourites } from "../services/favouritesService";
import { addMealToShoppingList } from "../services/shoppingListService";
import { Meal } from "../types/Meal";

type Section = {
	mealId: string;
	mealName: string;
	data: ShoppingListItem[];
};

export function ShoppingListScreen() {
	const [sections, setSections] = useState<Section[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddPanel, setShowAddPanel] = useState(false);
	const [favourites, setFavourites] = useState<Meal[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const items = await getShoppingList();
			const grouped = groupByMeal(items);
			setSections(
				grouped.map((g) => ({
					mealId: g.mealId,
					mealName: g.mealName,
					data: g.items,
				})),
			);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load]),
	);

	const openAddPanel = useCallback(async () => {
		const favs = await getFavourites();
		setFavourites(favs);
		setShowAddPanel(true);
	}, []);

	const handleAddFromFavourite = useCallback(
		async (meal: Meal) => {
			await addMealToShoppingList(meal);
			setShowAddPanel(false);
			await load();
		},
		[load],
	);

	const handleToggle = useCallback(
		async (id: string) => {
			await toggleShoppingItem(id);
			await load();
		},
		[load],
	);

	const handleRemoveItem = useCallback(
		async (id: string) => {
			await removeShoppingItem(id);
			await load();
		},
		[load],
	);

	const handleRemoveMeal = useCallback(
		(mealId: string, mealName: string) => {
			Alert.alert("Remove meal", `Remove all ingredients from "${mealName}"?`, [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: async () => {
						await removeMealFromShoppingList(mealId);
						await load();
					},
				},
			]);
		},
		[load],
	);

	const handleClearChecked = useCallback(async () => {
		const allItems = sections.flatMap((s) => s.data);
		const checkedCount = allItems.filter((i) => i.checked).length;
		if (checkedCount === 0) return;

		Alert.alert(
			"Clear checked",
			`Remove ${checkedCount} checked item${checkedCount !== 1 ? "s" : ""}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear",
					style: "destructive",
					onPress: async () => {
						await clearCheckedItems();
						await load();
					},
				},
			],
		);
	}, [sections, load]);

	const handleClearAll = useCallback(() => {
		Alert.alert("Clear all", "Remove everything from your shopping list?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Clear all",
				style: "destructive",
				onPress: async () => {
					await clearShoppingList();
					await load();
				},
			},
		]);
	}, [load]);

	const totalItems = sections.reduce((sum, s) => sum + s.data.length, 0);
	const checkedItems = sections.reduce(
		(sum, s) => sum + s.data.filter((i) => i.checked).length,
		0,
	);
	const hasChecked = checkedItems > 0;

	const isEmpty = !loading && sections.length === 0;

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{/* Add from Favourites Modal */}
			<Modal
				visible={showAddPanel}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowAddPanel(false)}
			>
				<SafeAreaView className="flex-1 bg-zinc-950">
					<View className="px-6 pt-6 pb-4">
						<View className="flex-row items-center justify-between mb-1">
							<Text className="text-sm font-semibold tracking-widest uppercase text-emerald-500">
								Add ingredients
							</Text>
							<Pressable
								onPress={() => setShowAddPanel(false)}
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
								const inList = sections.some((s) => s.mealId === item.idMeal);
								return (
									<Pressable
										onPress={() => handleAddFromFavourite(item)}
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
												{item.ingredients?.filter((i) => i.ingredient).length ??
													0}{" "}
												ingredients
												{item.strCategory ? ` · ${item.strCategory}` : ""}
											</Text>
										</View>
										{inList ? (
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

			{/* Header */}
			<View className="px-6 pt-6 pb-4 bg-zinc-950">
				<BackButton />

				<View className="flex-row items-end justify-between mt-1">
					<View>
						<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
							Grocery list
						</Text>
						<Text
							className="text-4xl font-black text-white"
							style={{ letterSpacing: -0.5 }}
						>
							Shopping List
						</Text>
					</View>

					{totalItems > 0 && (
						<View className="items-end mb-1">
							<View className="px-3 py-1 rounded-full bg-zinc-800">
								<Text className="text-sm font-semibold text-zinc-400">
									{checkedItems}/{totalItems}
								</Text>
							</View>
							{totalItems > 0 && (
								<View
									className="mt-1.5 h-1.5 rounded-full bg-zinc-800 overflow-hidden"
									style={{ width: 80 }}
								>
									<View
										className="h-full rounded-full bg-emerald-500"
										style={{
											width: `${Math.round((checkedItems / totalItems) * 100)}%`,
										}}
									/>
								</View>
							)}
						</View>
					)}
				</View>

				{/* Action row */}
				<View className="flex-row gap-3 mt-4">
					<Pressable
						onPress={openAddPanel}
						className="flex-row flex-1 items-center justify-center py-3 bg-emerald-500 rounded-2xl active:scale-[0.98]"
					>
						<Text className="mr-2 text-base">🛒</Text>
						<Text className="text-sm font-bold text-zinc-950">
							Add from Favourites
						</Text>
					</Pressable>

					{hasChecked && (
						<Pressable
							onPress={handleClearChecked}
							className="flex-row items-center justify-center px-4 py-3 border border-zinc-700 bg-zinc-900 rounded-2xl active:scale-[0.98]"
						>
							<Text className="text-sm font-bold text-zinc-400">
								Clear checked
							</Text>
						</Pressable>
					)}

					{totalItems > 0 && !hasChecked && (
						<Pressable
							onPress={handleClearAll}
							className="flex-row items-center justify-center px-4 py-3 border border-red-800/40 bg-red-900/20 rounded-2xl active:scale-[0.98]"
						>
							<Text className="text-sm font-bold text-red-400">Clear all</Text>
						</Pressable>
					)}
				</View>
			</View>

			<View className="h-px mx-6 mb-2 bg-zinc-800" />

			{/* Empty state */}
			{isEmpty && (
				<View className="items-center justify-center flex-1 px-8">
					<View className="items-center justify-center w-24 h-24 mb-6 rounded-full bg-zinc-900 border-2 border-zinc-800">
						<Text className="text-5xl">🛒</Text>
					</View>
					<Text className="mb-2 text-xl font-black text-center text-white">
						Your list is empty
					</Text>
					<Text className="text-sm leading-6 text-center text-zinc-500">
						Tap{" "}
						<Text className="font-semibold text-emerald-400">
							Add from Favourites
						</Text>{" "}
						to pull in ingredients from your saved meals.
					</Text>
				</View>
			)}

			{/* List */}
			{!isEmpty && (
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingTop: 8,
						paddingBottom: 48,
					}}
					showsVerticalScrollIndicator={false}
					stickySectionHeadersEnabled={false}
					renderSectionHeader={({ section }) => (
						<View className="flex-row items-center justify-between mt-4 mb-2">
							<View className="flex-row items-center flex-1 mr-3">
								<View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
								<Text
									className="text-sm font-bold text-zinc-300"
									numberOfLines={1}
								>
									{section.mealName}
								</Text>
								<View className="ml-2 px-2 py-0.5 rounded-full bg-zinc-800">
									<Text className="text-xs font-semibold text-zinc-500">
										{section.data.filter((i) => i.checked).length}/
										{section.data.length}
									</Text>
								</View>
							</View>
							<Pressable
								onPress={() =>
									handleRemoveMeal(section.mealId, section.mealName)
								}
								className="px-2.5 py-1 rounded-lg bg-red-900/25 border border-red-800/30 active:scale-[0.97]"
							>
								<Text className="text-xs font-semibold text-red-400">
									Remove
								</Text>
							</Pressable>
						</View>
					)}
					renderItem={({ item }) => (
						<Pressable
							onPress={() => handleToggle(item.id)}
							className={`flex-row items-center px-4 py-3 mb-2 rounded-2xl border active:scale-[0.98] ${
								item.checked
									? "bg-zinc-900/50 border-zinc-800/50"
									: "bg-zinc-900 border-zinc-800"
							}`}
						>
							{/* Checkbox */}
							<View
								className={`w-6 h-6 rounded-full mr-3 items-center justify-center border-2 flex-shrink-0 ${
									item.checked
										? "bg-emerald-500 border-emerald-500"
										: "border-zinc-600"
								}`}
							>
								{item.checked && (
									<Text className="text-xs font-black text-zinc-950">✓</Text>
								)}
							</View>

							{/* Text */}
							<View className="flex-1">
								<Text
									className={`text-sm font-semibold leading-snug ${
										item.checked ? "line-through text-zinc-600" : "text-white"
									}`}
								>
									{item.ingredient}
								</Text>
								{item.measure ? (
									<Text
										className={`text-xs mt-0.5 ${
											item.checked ? "text-zinc-700" : "text-zinc-500"
										}`}
									>
										{item.measure}
									</Text>
								) : null}
							</View>

							{/* Delete button */}
							<Pressable
								onPress={() => handleRemoveItem(item.id)}
								hitSlop={8}
								className="items-center justify-center w-7 h-7 ml-2 rounded-full bg-zinc-800 active:bg-red-900/40"
							>
								<Text className="text-xs font-bold text-zinc-500">✕</Text>
							</Pressable>
						</Pressable>
					)}
					renderSectionFooter={() => (
						<View className="h-px mb-2 bg-zinc-800/60" />
					)}
				/>
			)}
		</SafeAreaView>
	);
}
