import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	FlatList,
	Image,
	Keyboard,
	Linking,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	BackButton,
	FullscreenImageViewer,
	IngredientsList,
	OfflineBadge,
} from "../components";
import {
	addRecentMeal,
	cacheMeal,
	isFavourite,
	isMealCached,
	removeCustomMeal,
	removeFavourite,
	removeRecentMeal,
	saveFavourite,
} from "../services";
import { deleteNote, getNote, saveNote } from "../services/notesService";
import {
	addMealToShoppingList,
	isMealInShoppingList,
	removeMealFromShoppingList,
} from "../services/shoppingListService";
import {
	Collection,
	addMealToCollection,
	getCollections,
	getCollectionsForMeal,
} from "../services/collectionsService";
import { Meal } from "../types/Meal";
import { shareMeal } from "../utils/share";

type Props = {
	route: { params: { meal: Meal } };
};

function ServingsScaler({
	servings,
	onDecrement,
	onIncrement,
}: {
	servings: number;
	onDecrement: () => void;
	onIncrement: () => void;
}) {
	return (
		<View className="flex-row items-center ml-auto gap-1">
			<Pressable
				onPress={onDecrement}
				disabled={servings <= 1}
				className={`items-center justify-center w-8 h-8 rounded-xl border active:scale-[0.95] ${
					servings <= 1
						? "border-zinc-800 bg-zinc-900 opacity-40"
						: "border-zinc-700 bg-zinc-800"
				}`}
			>
				<Text className="text-base font-black text-zinc-300">−</Text>
			</Pressable>

			<View className="items-center justify-center w-10 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
				<Text className="text-sm font-black text-emerald-400">{servings}×</Text>
			</View>

			<Pressable
				onPress={onIncrement}
				disabled={servings >= 10}
				className={`items-center justify-center w-8 h-8 rounded-xl border active:scale-[0.95] ${
					servings >= 10
						? "border-zinc-800 bg-zinc-900 opacity-40"
						: "border-zinc-700 bg-zinc-800"
				}`}
			>
				<Text className="text-base font-black text-zinc-300">+</Text>
			</Pressable>
		</View>
	);
}

function AddToCollectionSheet({
	visible,
	meal,
	onClose,
}: {
	visible: boolean;
	meal: Meal;
	onClose: () => void;
}) {
	const [collections, setCollections] = useState<Collection[]>([]);
	const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [adding, setAdding] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const [all, withMeal] = await Promise.all([
				getCollections(),
				getCollectionsForMeal(meal.idMeal),
			]);
			setCollections(all);
			setMemberIds(new Set(withMeal.map((c) => c.id)));
		} catch (e) {
			console.error("Failed to load collections for sheet", e);
		} finally {
			setLoading(false);
		}
	}, [meal.idMeal]);

	useEffect(() => {
		if (visible) load();
	}, [visible, load]);

	const handleToggle = useCallback(
		async (collection: Collection) => {
			if (adding) return;
			setAdding(collection.id);
			try {
				await addMealToCollection(collection.id, meal);
				setMemberIds((prev) => new Set([...prev, collection.id]));
			} catch (e) {
				console.error("Failed to add to collection", e);
			} finally {
				setAdding(null);
			}
		},
		[meal, adding],
	);

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
							Save to
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
						Add to Collection
					</Text>
					<Text className="mt-1 text-sm text-zinc-500" numberOfLines={1}>
						{meal.strMeal}
					</Text>
				</View>

				<View className="h-px mx-6 mb-3 bg-zinc-800" />

				{loading ? (
					<View className="flex-1 items-center justify-center">
						<Text className="text-zinc-500">Loading collections…</Text>
					</View>
				) : collections.length === 0 ? (
					<View className="flex-1 items-center justify-center px-8">
						<Text className="text-5xl mb-3">🗂️</Text>
						<Text className="text-base font-bold text-center text-white mb-1">
							No collections yet
						</Text>
						<Text className="text-sm text-center text-zinc-500 leading-6">
							Head to the Collections screen to create your first list, then
							come back here to save this meal.
						</Text>
						<Pressable
							onPress={onClose}
							className="mt-6 px-6 py-3 bg-zinc-800 rounded-2xl active:scale-[0.98]"
						>
							<Text className="text-sm font-bold text-white">Dismiss</Text>
						</Pressable>
					</View>
				) : (
					<FlatList
						data={collections}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{
							paddingHorizontal: 24,
							paddingBottom: 48,
						}}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => {
							const isMember = memberIds.has(item.id);
							const isAdding = adding === item.id;
							return (
								<Pressable
									onPress={() => !isMember && handleToggle(item)}
									className={`flex-row items-center p-4 mb-3 border rounded-2xl active:scale-[0.98] ${
										isMember
											? "border-emerald-500/40 bg-emerald-500/8"
											: "border-zinc-800 bg-zinc-900"
									}`}
								>
									{/* Emoji icon */}
									<View className="items-center justify-center w-11 h-11 mr-4 rounded-xl bg-zinc-800">
										<Text className="text-2xl">{item.emoji}</Text>
									</View>

									{/* Name + count */}
									<View className="flex-1">
										<Text
											className="text-base font-bold text-white"
											numberOfLines={1}
										>
											{item.name}
										</Text>
										<Text className="text-xs text-zinc-500 mt-0.5">
											{item.meals.length} meal
											{item.meals.length !== 1 ? "s" : ""}
										</Text>
									</View>

									{/* Status badge */}
									{isMember ? (
										<View className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
											<Text className="text-xs font-bold text-emerald-400">
												✓ Added
											</Text>
										</View>
									) : isAdding ? (
										<View className="px-3 py-1 rounded-full bg-zinc-700">
											<Text className="text-xs font-semibold text-zinc-400">
												…
											</Text>
										</View>
									) : (
										<View className="px-3 py-1 rounded-full bg-zinc-700">
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

export function MealScreen({ route }: Props) {
	const { meal } = route.params;
	const navigation = useNavigation();

	const [isFav, setIsFav] = useState(false);
	const [isCached, setIsCached] = useState(false);
	const [viewerVisible, setViewerVisible] = useState(false);
	const [inShoppingList, setInShoppingList] = useState(false);
	const [note, setNote] = useState("");
	const [editingNote, setEditingNote] = useState(false);
	const [noteDraft, setNoteDraft] = useState("");
	const noteInputRef = useRef<TextInput>(null);

	// Servings scaler (1 = no scaling)
	const [servings, setServings] = useState(1);

	// Add to Collection sheet
	const [collectionSheetVisible, setCollectionSheetVisible] = useState(false);

	useEffect(() => {
		checkFavourite();
		checkCache();
		checkShoppingList();
		loadNote();
		cacheMeal(meal);
		addRecentMeal(meal.idMeal);
	}, [meal.idMeal]);

	const checkFavourite = useCallback(async () => {
		const result = await isFavourite(meal.idMeal);
		setIsFav(result);
	}, [meal.idMeal]);

	const checkCache = useCallback(async () => {
		const cached = await isMealCached(meal.idMeal);
		setIsCached(cached);
	}, [meal.idMeal]);

	const checkShoppingList = useCallback(async () => {
		const inList = await isMealInShoppingList(meal.idMeal);
		setInShoppingList(inList);
	}, [meal.idMeal]);

	const loadNote = useCallback(async () => {
		const saved = await getNote(meal.idMeal);
		setNote(saved);
	}, [meal.idMeal]);

	const toggleFavourite = useCallback(async () => {
		if (isFav) {
			await removeFavourite(meal.idMeal);
			setIsFav(false);
		} else {
			await saveFavourite(meal);
			setIsFav(true);
			setIsCached(true);
		}
	}, [isFav, meal]);

	const handleShare = useCallback(async () => {
		await shareMeal(meal);
	}, [meal]);

	const toggleShoppingList = useCallback(async () => {
		if (inShoppingList) {
			await removeMealFromShoppingList(meal.idMeal);
			setInShoppingList(false);
		} else {
			if (!meal.ingredients || meal.ingredients.length === 0) {
				Alert.alert(
					"No ingredients",
					"This meal has no ingredients to add to the shopping list.",
				);
				return;
			}
			await addMealToShoppingList(meal);
			setInShoppingList(true);
		}
	}, [inShoppingList, meal]);

	const handleEditNote = useCallback(() => {
		setNoteDraft(note);
		setEditingNote(true);
		setTimeout(() => noteInputRef.current?.focus(), 50);
	}, [note]);

	const handleSaveNote = useCallback(async () => {
		Keyboard.dismiss();
		await saveNote(meal.idMeal, noteDraft);
		setNote(noteDraft.trim());
		setEditingNote(false);
	}, [meal.idMeal, noteDraft]);

	const handleCancelNote = useCallback(() => {
		Keyboard.dismiss();
		setNoteDraft("");
		setEditingNote(false);
	}, []);

	const handleDeleteNote = useCallback(() => {
		Alert.alert("Delete note", "Remove your personal note for this meal?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					await deleteNote(meal.idMeal);
					setNote("");
					setEditingNote(false);
				},
			},
		]);
	}, [meal.idMeal]);

	const handleDelete = useCallback(() => {
		Alert.alert(
			"Delete meal",
			"Are you sure you want to delete this custom meal?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await removeCustomMeal(meal.idMeal);
							await removeRecentMeal(meal.idMeal);
							navigation.goBack();
						} catch (e) {
							console.error("Failed to delete custom meal", e);
							Alert.alert("Error", "Failed to delete meal");
						}
					},
				},
			],
		);
	}, [meal.idMeal, navigation]);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<AddToCollectionSheet
				visible={collectionSheetVisible}
				meal={meal}
				onClose={() => setCollectionSheetVisible(false)}
			/>

			<ScrollView
				contentContainerStyle={{ paddingBottom: 48 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero image */}
				<View className="relative">
					<Pressable onPress={() => setViewerVisible(true)}>
						<Image
							source={{ uri: meal.strMealThumb }}
							className="w-full"
							style={{ height: 320 }}
							resizeMode="cover"
						/>
					</Pressable>

					{/* Back button overlay */}
					<View className="absolute top-4 left-4">
						<BackButton />
					</View>

					{/* Tap-to-expand hint */}
					<View className="absolute bottom-4 right-4">
						<View className="px-3 py-1 rounded-full bg-zinc-950/70">
							<Text className="text-xs font-semibold text-zinc-300">
								🔍 Tap to expand
							</Text>
						</View>
					</View>
				</View>

				<FullscreenImageViewer
					visible={viewerVisible}
					uri={meal.strMealThumb}
					onClose={() => setViewerVisible(false)}
				/>

				<View className="px-5">
					{/* Title & tags */}
					<View className="pt-5 pb-4">
						<Text
							className="mb-3 text-3xl font-black leading-tight text-white"
							style={{ letterSpacing: -0.5 }}
						>
							{meal.strMeal}
						</Text>

						<View className="flex-row flex-wrap gap-2 mb-2">
							{meal.strCategory ? (
								<View className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
									<Text className="text-sm font-semibold text-emerald-400">
										{meal.strCategory}
									</Text>
								</View>
							) : null}
							{meal.strArea ? (
								<View className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30">
									<Text className="text-sm font-semibold text-cyan-400">
										🌍 {meal.strArea}
									</Text>
								</View>
							) : null}
							{meal.isLocal ? (
								<View className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30">
									<Text className="text-sm font-semibold text-violet-400">
										✏️ Custom
									</Text>
								</View>
							) : null}
						</View>

						{isCached && <OfflineBadge className="mt-1" />}
					</View>

					<View className="h-px mb-5 bg-zinc-800" />

					{/* Favourite button */}
					<Pressable
						onPress={toggleFavourite}
						className={`flex-row items-center justify-center py-4 mb-3 rounded-2xl active:scale-[0.98] ${
							isFav
								? "bg-red-500/15 border-2 border-red-500/40"
								: "bg-emerald-500 border-2 border-emerald-500"
						}`}
					>
						<Text className="mr-2 text-xl">{isFav ? "❤️" : "🤍"}</Text>
						<Text
							className={`text-base font-bold ${isFav ? "text-red-400" : "text-zinc-950"}`}
						>
							{isFav ? "Remove from Favourites" : "Add to Favourites"}
						</Text>
					</Pressable>

					{/* Shopping list + Share row */}
					<View className="flex-row gap-3 mb-3">
						<Pressable
							onPress={toggleShoppingList}
							className={`flex-row flex-1 items-center justify-center py-3 border-2 rounded-2xl active:scale-[0.98] ${
								inShoppingList
									? "bg-cyan-500/15 border-cyan-500/40"
									: "border-zinc-700 bg-zinc-900"
							}`}
						>
							<Text className="mr-2 text-lg">🛒</Text>
							<Text
								className={`text-sm font-bold ${
									inShoppingList ? "text-cyan-400" : "text-white"
								}`}
							>
								{inShoppingList ? "In Shopping List" : "Add to List"}
							</Text>
						</Pressable>

						{(meal.strSource || meal.strYoutube) && (
							<Pressable
								onPress={handleShare}
								className="flex-row flex-1 items-center justify-center py-3 border-2 border-zinc-700 rounded-2xl bg-zinc-900 active:scale-[0.98]"
							>
								<Text className="mr-2 text-lg">📤</Text>
								<Text className="text-sm font-bold text-white">Share</Text>
							</Pressable>
						)}
					</View>

					{/* Add to Collection button */}
					<Pressable
						onPress={() => setCollectionSheetVisible(true)}
						className="flex-row items-center justify-center py-3 mb-3 border-2 border-zinc-700 rounded-2xl bg-zinc-900 active:scale-[0.98]"
					>
						<Text className="mr-2 text-lg">🗂️</Text>
						<Text className="text-sm font-bold text-white">
							Add to Collection
						</Text>
					</Pressable>

					{/* Edit / Delete row (custom meals only) */}
					{meal.isLocal && (
						<View className="flex-row gap-3 mb-6">
							<Pressable
								onPress={() => {
									// @ts-ignore
									navigation.navigate("AddMeal", { meal });
								}}
								className="flex-row flex-1 items-center justify-center py-3 bg-emerald-600/20 border-2 border-emerald-600/40 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-lg">✏️</Text>
								<Text className="text-sm font-bold text-emerald-400">Edit</Text>
							</Pressable>

							<Pressable
								onPress={handleDelete}
								className="flex-row flex-1 items-center justify-center py-3 bg-red-600/20 border-2 border-red-600/40 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-lg">🗑️</Text>
								<Text className="text-sm font-bold text-red-400">Delete</Text>
							</Pressable>
						</View>
					)}

					{/* Ingredients */}
					<View className="p-5 mb-4 border border-zinc-800 bg-zinc-900 rounded-3xl">
						{/* Section header with servings scaler */}
						<View className="flex-row items-center mb-4">
							<View className="items-center justify-center w-9 h-9 mr-3 rounded-xl bg-emerald-500/15">
								<Text className="text-lg">🥗</Text>
							</View>
							<View>
								<Text className="text-lg font-bold text-white">
									Ingredients
								</Text>
								{servings > 1 && (
									<Text className="text-xs text-emerald-400 mt-0.5">
										Scaled for {servings} servings
									</Text>
								)}
							</View>
							<View className="ml-auto px-2 py-0.5 rounded-full bg-zinc-800 mr-2">
								<Text className="text-xs font-semibold text-zinc-400">
									{meal.ingredients?.filter((i) => i.ingredient).length ?? 0}
								</Text>
							</View>
							<ServingsScaler
								servings={servings}
								onDecrement={() => setServings((s) => Math.max(1, s - 1))}
								onIncrement={() => setServings((s) => Math.min(10, s + 1))}
							/>
						</View>
						<IngredientsList
							ingredients={meal.ingredients}
							servings={servings}
						/>
					</View>

					{/* Personal Notes */}
					<View className="p-5 mb-4 border border-zinc-800 bg-zinc-900 rounded-3xl">
						<View className="flex-row items-center mb-4">
							<View className="items-center justify-center w-9 h-9 mr-3 rounded-xl bg-amber-500/15">
								<Text className="text-lg">🗒️</Text>
							</View>
							<Text className="text-lg font-bold text-white">My Notes</Text>
							{note.length > 0 && !editingNote && (
								<View className="flex-row ml-auto gap-2">
									<Pressable
										onPress={handleEditNote}
										className="px-3 py-1 rounded-lg bg-zinc-800 active:bg-zinc-700"
									>
										<Text className="text-xs font-semibold text-zinc-300">
											Edit
										</Text>
									</Pressable>
									<Pressable
										onPress={handleDeleteNote}
										className="px-3 py-1 rounded-lg bg-red-900/25 border border-red-800/30 active:scale-[0.97]"
									>
										<Text className="text-xs font-semibold text-red-400">
											Delete
										</Text>
									</Pressable>
								</View>
							)}
						</View>

						{editingNote ? (
							<View>
								<TextInput
									ref={noteInputRef}
									value={noteDraft}
									onChangeText={setNoteDraft}
									placeholder="Write a personal note about this meal…"
									placeholderTextColor="#52525b"
									multiline
									textAlignVertical="top"
									className="w-full px-4 py-3 text-sm text-white border-2 border-zinc-700 bg-zinc-800 rounded-2xl"
									style={{ lineHeight: 22, minHeight: 100 }}
								/>
								<View className="flex-row gap-3 mt-3">
									<Pressable
										onPress={handleSaveNote}
										className="flex-1 items-center justify-center py-3 bg-amber-500 rounded-2xl active:scale-[0.98]"
									>
										<Text className="text-sm font-bold text-zinc-950">
											Save Note
										</Text>
									</Pressable>
									<Pressable
										onPress={handleCancelNote}
										className="flex-1 items-center justify-center py-3 border border-zinc-700 bg-zinc-900 rounded-2xl active:scale-[0.98]"
									>
										<Text className="text-sm font-bold text-zinc-400">
											Cancel
										</Text>
									</Pressable>
								</View>
							</View>
						) : note.length > 0 ? (
							<Text className="text-sm leading-6 text-zinc-300">{note}</Text>
						) : (
							<Pressable
								onPress={handleEditNote}
								className="flex-row items-center justify-center py-4 border-2 border-dashed border-zinc-700 rounded-2xl active:border-amber-500/50"
							>
								<Text className="mr-2 text-base">✏️</Text>
								<Text className="text-sm font-semibold text-zinc-500">
									Add a personal note…
								</Text>
							</Pressable>
						)}
					</View>

					{/* Instructions */}
					<View className="p-5 mb-6 border border-zinc-800 bg-zinc-900 rounded-3xl">
						<View className="flex-row items-center mb-4">
							<View className="items-center justify-center w-9 h-9 mr-3 rounded-xl bg-cyan-500/15">
								<Text className="text-lg">📝</Text>
							</View>
							<Text className="text-lg font-bold text-white">Instructions</Text>
						</View>
						<Text
							className="text-sm leading-7 text-zinc-300"
							style={{ lineHeight: 26 }}
						>
							{meal.strInstructions}
						</Text>
					</View>

					{/* More Resources */}
					{(meal.strYoutube || meal.strSource) && (
						<View className="gap-3">
							<Text className="mb-1 text-xs font-semibold tracking-widest uppercase text-zinc-500">
								More Resources
							</Text>

							{meal.strYoutube && (
								<Pressable
									onPress={() => Linking.openURL(meal.strYoutube)}
									className="flex-row items-center py-4 px-5 bg-red-600/15 border border-red-600/30 rounded-2xl active:scale-[0.98]"
								>
									<View className="items-center justify-center w-10 h-10 mr-4 rounded-xl bg-red-600">
										<Text className="text-lg">▶️</Text>
									</View>
									<View className="flex-1">
										<Text className="text-sm font-bold text-white">
											Watch on YouTube
										</Text>
										<Text className="text-xs text-zinc-500">
											Video recipe walkthrough
										</Text>
									</View>
									<Text className="text-zinc-600">›</Text>
								</Pressable>
							)}

							{meal.strSource && (
								<Pressable
									onPress={() => Linking.openURL(meal.strSource)}
									className="flex-row items-center py-4 px-5 bg-blue-600/15 border border-blue-600/30 rounded-2xl active:scale-[0.98]"
								>
									<View className="items-center justify-center w-10 h-10 mr-4 rounded-xl bg-blue-600">
										<Text className="text-lg">🌐</Text>
									</View>
									<View className="flex-1">
										<Text className="text-sm font-bold text-white">
											View Full Recipe
										</Text>
										<Text className="text-xs text-zinc-500">
											Original source article
										</Text>
									</View>
									<Text className="text-zinc-600">›</Text>
								</Pressable>
							)}
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
