import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { useCallback, useState } from "react";
import {
	Alert,
	FlatList,
	Image,
	Modal,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../components";
import {
	Collection,
	addMealToCollection,
	createCollection,
	deleteCollection,
	getCollections,
	removeMealFromCollection,
	renameCollection,
} from "../services/collectionsService";
import { getFavourites } from "../services/favouritesService";
import { Meal } from "../types/Meal";

function ModalHeader({
	label,
	title,
	onClose,
}: {
	label: string;
	title: string;
	onClose: () => void;
}) {
	return (
		<>
			<View className="flex-row items-center justify-between mb-1">
				<Text className="text-sm font-semibold tracking-widest uppercase text-emerald-500">
					{label}
				</Text>
				<Pressable
					onPress={onClose}
					className="items-center justify-center w-9 h-9 rounded-full bg-zinc-800 active:bg-zinc-700"
				>
					<Text className="text-base font-bold text-zinc-300">✕</Text>
				</Pressable>
			</View>
			<Text
				className="text-3xl font-black text-white mb-1"
				style={{ letterSpacing: -0.5 }}
			>
				{title}
			</Text>
		</>
	);
}

const EMOJI_OPTIONS = [
	"🍽️",
	"🥗",
	"🍝",
	"🍣",
	"🍕",
	"🥩",
	"🍜",
	"🥘",
	"🍛",
	"🧆",
	"🥙",
	"🌮",
	"🍤",
	"🥚",
	"🧇",
	"🥞",
	"🍱",
	"🥡",
	"🍲",
	"🫕",
	"❤️",
	"⭐",
	"🔥",
	"💚",
	"💜",
	"🎯",
	"🏆",
	"✨",
	"🎉",
	"📌",
];

type ModalMode =
	| { type: "create" }
	| { type: "rename"; collection: Collection }
	| { type: "add_meal"; collection: Collection }
	| { type: "view"; collection: Collection }
	| null;

function EmojiPicker({
	selected,
	onSelect,
}: {
	selected: string;
	onSelect: (e: string) => void;
}) {
	return (
		<View className="flex-row flex-wrap gap-2 mb-4">
			{EMOJI_OPTIONS.map((emoji) => (
				<Pressable
					key={emoji}
					onPress={() => onSelect(emoji)}
					className={`w-10 h-10 items-center justify-center rounded-xl border-2 active:scale-[0.95] ${
						selected === emoji
							? "border-emerald-500 bg-emerald-500/20"
							: "border-zinc-700 bg-zinc-900"
					}`}
				>
					<Text className="text-xl">{emoji}</Text>
				</Pressable>
			))}
		</View>
	);
}

function CollectionCard({
	collection,
	onPress,
	onRename,
	onDelete,
}: {
	collection: Collection;
	onPress: () => void;
	onRename: () => void;
	onDelete: () => void;
}) {
	const preview = collection.meals.slice(0, 3);
	const extra = collection.meals.length - 3;

	return (
		<Pressable
			onPress={onPress}
			className="mb-4 p-4 rounded-3xl border border-zinc-800 bg-zinc-900 active:scale-[0.98]"
		>
			{/* Header */}
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center gap-3 flex-1">
					<View className="w-11 h-11 items-center justify-center rounded-2xl bg-zinc-800">
						<Text className="text-2xl">{collection.emoji}</Text>
					</View>
					<View className="flex-1">
						<Text className="text-base font-black text-white" numberOfLines={1}>
							{collection.name}
						</Text>
						<Text className="text-xs text-zinc-500 mt-0.5">
							{collection.meals.length} meal
							{collection.meals.length !== 1 ? "s" : ""}
						</Text>
					</View>
				</View>

				<View className="flex-row gap-2">
					<Pressable
						onPress={(e) => {
							e.stopPropagation();
							onRename();
						}}
						className="px-2.5 py-1 rounded-lg bg-zinc-800 active:bg-zinc-700"
					>
						<Text className="text-xs font-semibold text-zinc-300">Edit</Text>
					</Pressable>
					<Pressable
						onPress={(e) => {
							e.stopPropagation();
							onDelete();
						}}
						className="px-2.5 py-1 rounded-lg bg-red-900/25 border border-red-800/30 active:scale-[0.97]"
					>
						<Text className="text-xs font-semibold text-red-400">Delete</Text>
					</Pressable>
				</View>
			</View>

			{/* Meal thumbnails */}
			{collection.meals.length === 0 ? (
				<View className="items-center py-4 rounded-2xl border-2 border-dashed border-zinc-800">
					<Text className="text-sm text-zinc-600">
						No meals yet — tap to add
					</Text>
				</View>
			) : (
				<View className="flex-row gap-2">
					{preview.map((meal) => (
						<View
							key={meal.idMeal}
							className="flex-1 overflow-hidden rounded-2xl"
							style={{ maxWidth: 100 }}
						>
							<Image
								source={{ uri: meal.strMealThumb }}
								style={{ height: 64 }}
								resizeMode="cover"
								className="w-full"
							/>
						</View>
					))}
					{extra > 0 && (
						<View className="flex-1 items-center justify-center rounded-2xl bg-zinc-800">
							<Text className="text-sm font-black text-zinc-400">+{extra}</Text>
						</View>
					)}
				</View>
			)}
		</Pressable>
	);
}

export function CollectionsScreen() {
	const navigation = useNavigation();
	const [collections, setCollections] = useState<Collection[]>([]);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<ModalMode>(null);

	// Form state
	const [formName, setFormName] = useState("");
	const [formEmoji, setFormEmoji] = useState("🍽️");

	// Add meal picker state
	const [favourites, setFavourites] = useState<Meal[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const cols = await getCollections();
			setCollections(cols);
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

	// ── Create ──────────────────────────────────────────────────────────────
	const openCreate = useCallback(() => {
		setFormName("");
		setFormEmoji("🍽️");
		setModal({ type: "create" });
	}, []);

	const handleCreate = useCallback(async () => {
		if (!formName.trim()) return;
		await createCollection(formName, formEmoji);
		setModal(null);
		await load();
	}, [formName, formEmoji, load]);

	// ── Rename ───────────────────────────────────────────────────────────────
	const openRename = useCallback((collection: Collection) => {
		setFormName(collection.name);
		setFormEmoji(collection.emoji);
		setModal({ type: "rename", collection });
	}, []);

	const handleRename = useCallback(async () => {
		if (modal?.type !== "rename" || !formName.trim()) return;
		await renameCollection(modal.collection.id, formName, formEmoji);
		setModal(null);
		await load();
	}, [modal, formName, formEmoji, load]);

	// ── Delete ───────────────────────────────────────────────────────────────
	const handleDelete = useCallback(
		(collection: Collection) => {
			Alert.alert(
				"Delete collection",
				`Remove "${collection.name}" and all its meal links?`,
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Delete",
						style: "destructive",
						onPress: async () => {
							await deleteCollection(collection.id);
							await load();
						},
					},
				],
			);
		},
		[load],
	);

	// ── View / Remove meal ───────────────────────────────────────────────────
	const openView = useCallback((collection: Collection) => {
		setModal({ type: "view", collection });
	}, []);

	const handleRemoveMeal = useCallback(
		async (collectionId: string, mealId: string) => {
			await removeMealFromCollection(collectionId, mealId);
			// Refresh the collection inside the modal
			const updated = await getCollections();
			const refreshed = updated.find((c) => c.id === collectionId);
			if (refreshed) {
				setModal({ type: "view", collection: refreshed });
			} else {
				setModal(null);
			}
			setCollections(updated);
		},
		[],
	);

	// ── Add meal ─────────────────────────────────────────────────────────────
	const openAddMeal = useCallback(async (collection: Collection) => {
		const favs = await getFavourites();
		setFavourites(favs);
		setModal({ type: "add_meal", collection });
	}, []);

	const handleAddMeal = useCallback(
		async (meal: Meal) => {
			if (modal?.type !== "add_meal") return;
			await addMealToCollection(modal.collection.id, meal);
			const updated = await getCollections();
			const refreshed = updated.find((c) => c.id === modal.collection.id);
			if (refreshed) {
				setModal({ type: "add_meal", collection: refreshed });
			}
			setCollections(updated);
		},
		[modal],
	);

	const isInCollection = useCallback(
		(mealId: string): boolean => {
			if (modal?.type !== "add_meal") return false;
			return modal.collection.meals.some((m) => m.idMeal === mealId);
		},
		[modal],
	);

	return (
		<SafeAreaView className="flex-1 bg-zinc-950">
			{/* ── Create / Rename modal ─────────────────────────────────────── */}
			<Modal
				visible={modal?.type === "create" || modal?.type === "rename"}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setModal(null)}
			>
				<SafeAreaView className="flex-1 bg-zinc-950">
					<View className="px-6 pt-6 pb-4">
						<ModalHeader
							label={
								modal?.type === "create" ? "New collection" : "Edit collection"
							}
							title={
								modal?.type === "create"
									? "Create Collection"
									: "Rename Collection"
							}
							onClose={() => setModal(null)}
						/>
					</View>
					<View className="h-px mx-6 mb-4 bg-zinc-800" />

					<View className="px-6">
						<Text className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
							Icon
						</Text>
						<EmojiPicker selected={formEmoji} onSelect={setFormEmoji} />

						<Text className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
							Name
						</Text>
						<TextInput
							value={formName}
							onChangeText={setFormName}
							placeholder="e.g. Quick Weeknight Dinners"
							placeholderTextColor="#52525b"
							autoFocus
							returnKeyType="done"
							onSubmitEditing={
								modal?.type === "create" ? handleCreate : handleRename
							}
							className="w-full px-4 py-4 text-base text-white border-2 border-zinc-700 bg-zinc-900 rounded-2xl mb-6"
						/>

						<Pressable
							onPress={modal?.type === "create" ? handleCreate : handleRename}
							disabled={!formName.trim()}
							className={`items-center justify-center py-4 rounded-2xl active:scale-[0.98] ${
								formName.trim() ? "bg-emerald-500" : "bg-zinc-800"
							}`}
						>
							<Text
								className={`text-base font-bold ${
									formName.trim() ? "text-zinc-950" : "text-zinc-600"
								}`}
							>
								{modal?.type === "create"
									? "Create Collection"
									: "Save Changes"}
							</Text>
						</Pressable>
					</View>
				</SafeAreaView>
			</Modal>

			{/* ── View collection modal ─────────────────────────────────────── */}
			<Modal
				visible={modal?.type === "view"}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setModal(null)}
			>
				<SafeAreaView className="flex-1 bg-zinc-950">
					{modal?.type === "view" && (
						<>
							<View className="px-6 pt-6 pb-4">
								<ModalHeader
									label={`${modal.collection.emoji} Collection`}
									title={modal.collection.name}
									onClose={() => setModal(null)}
								/>
								<Text className="text-sm text-zinc-500">
									{modal.collection.meals.length} meal
									{modal.collection.meals.length !== 1 ? "s" : ""}
								</Text>
							</View>
							<View className="h-px mx-6 mb-3 bg-zinc-800" />

							<Pressable
								onPress={() => openAddMeal(modal.collection)}
								className="flex-row items-center justify-center mx-6 mb-3 py-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl active:scale-[0.98]"
							>
								<Text className="mr-2 text-base">➕</Text>
								<Text className="text-sm font-bold text-emerald-400">
									Add from Favourites
								</Text>
							</Pressable>

							{modal.collection.meals.length === 0 ? (
								<View className="flex-1 items-center justify-center px-8">
									<Text className="text-5xl mb-3">
										{modal.collection.emoji}
									</Text>
									<Text className="text-base font-bold text-center text-white mb-1">
										Empty collection
									</Text>
									<Text className="text-sm text-center text-zinc-500">
										Tap "Add from Favourites" to add your first meal.
									</Text>
								</View>
							) : (
								<FlatList
									data={modal.collection.meals}
									keyExtractor={(item) => item.idMeal}
									contentContainerStyle={{
										paddingHorizontal: 24,
										paddingBottom: 48,
									}}
									showsVerticalScrollIndicator={false}
									renderItem={({ item }) => (
										<Pressable
											onPress={() =>
												(navigation as any).navigate("Meal", { meal: item })
											}
											className="flex-row items-center p-3 mb-3 border border-zinc-800 bg-zinc-900 rounded-2xl active:scale-[0.98]"
										>
											{item.strMealThumb ? (
												<Image
													source={{ uri: item.strMealThumb }}
													className="rounded-xl mr-3 flex-shrink-0"
													style={{ width: 56, height: 56 }}
													resizeMode="cover"
												/>
											) : (
												<View className="w-14 h-14 rounded-xl mr-3 bg-zinc-800 items-center justify-center flex-shrink-0">
													<Text className="text-2xl">🍽️</Text>
												</View>
											)}
											<View className="flex-1">
												<Text
													className="text-sm font-bold text-white"
													numberOfLines={1}
												>
													{item.strMeal}
												</Text>
												<Text className="text-xs text-zinc-500 mt-0.5">
													{[item.strCategory, item.strArea]
														.filter(Boolean)
														.join(" · ")}
												</Text>
											</View>
											<Pressable
												onPress={() =>
													handleRemoveMeal(
														(modal as any).collection.id,
														item.idMeal,
													)
												}
												hitSlop={8}
												className="items-center justify-center w-8 h-8 ml-2 rounded-full bg-red-900/20 border border-red-800/30 active:scale-[0.97]"
											>
												<Text className="text-xs font-bold text-red-400">
													✕
												</Text>
											</Pressable>
										</Pressable>
									)}
								/>
							)}
						</>
					)}
				</SafeAreaView>
			</Modal>

			{/* ── Add meal picker modal ─────────────────────────────────────── */}
			<Modal
				visible={modal?.type === "add_meal"}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setModal(null)}
			>
				<SafeAreaView className="flex-1 bg-zinc-950">
					{modal?.type === "add_meal" && (
						<>
							<View className="px-6 pt-6 pb-4">
								<ModalHeader
									label="Add to collection"
									title="Pick a Meal"
									onClose={() => setModal(null)}
								/>
								<Text className="text-sm text-zinc-500">
									From your favourites
								</Text>
							</View>
							<View className="h-px mx-6 mb-3 bg-zinc-800" />

							{favourites.length === 0 ? (
								<View className="flex-1 items-center justify-center px-8">
									<Text className="text-5xl mb-3">🤍</Text>
									<Text className="text-base font-bold text-center text-white">
										No favourites yet
									</Text>
									<Text className="mt-1 text-sm text-center text-zinc-500">
										Save meals to your favourites first.
									</Text>
									<Pressable
										onPress={() => setModal(null)}
										className="mt-6 px-6 py-3 bg-zinc-800 rounded-2xl active:scale-[0.98]"
									>
										<Text className="text-sm font-bold text-white">
											Dismiss
										</Text>
									</Pressable>
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
										const added = isInCollection(item.idMeal);
										return (
											<Pressable
												onPress={() => !added && handleAddMeal(item)}
												className={`flex-row items-center p-3 mb-3 border rounded-2xl active:scale-[0.98] ${
													added
														? "border-emerald-700/40 bg-emerald-900/10"
														: "border-zinc-800 bg-zinc-900"
												}`}
											>
												{item.strMealThumb ? (
													<Image
														source={{ uri: item.strMealThumb }}
														className="rounded-xl mr-3 flex-shrink-0"
														style={{ width: 56, height: 56 }}
														resizeMode="cover"
													/>
												) : (
													<View className="w-14 h-14 rounded-xl mr-3 bg-zinc-800 items-center justify-center flex-shrink-0">
														<Text className="text-2xl">🍽️</Text>
													</View>
												)}
												<View className="flex-1">
													<Text
														className="text-base font-bold text-white"
														numberOfLines={1}
													>
														{item.strMeal}
													</Text>
													<Text className="text-xs text-zinc-500 mt-0.5">
														{[item.strCategory, item.strArea]
															.filter(Boolean)
															.join(" · ")}
													</Text>
												</View>
												{added ? (
													<View className="px-3 py-1 ml-2 rounded-full bg-emerald-500/15 border border-emerald-500/30">
														<Text className="text-xs font-semibold text-emerald-400">
															✓ Added
														</Text>
													</View>
												) : (
													<View className="px-3 py-1 ml-2 rounded-full bg-zinc-700">
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
						</>
					)}
				</SafeAreaView>
			</Modal>

			{/* ── Main screen ───────────────────────────────────────────────── */}
			<View className="px-6 pt-6 pb-4">
				<BackButton />
				<View className="flex-row items-end justify-between mt-1">
					<View>
						<Text className="mb-0.5 text-sm font-semibold tracking-widest uppercase text-emerald-500">
							Organise
						</Text>
						<Text
							className="text-4xl font-black text-white"
							style={{ letterSpacing: -0.5 }}
						>
							Collections
						</Text>
					</View>
					{collections.length > 0 && (
						<View className="px-3 py-1 mb-1 rounded-full bg-zinc-800">
							<Text className="text-sm font-semibold text-zinc-400">
								{collections.length} list{collections.length !== 1 ? "s" : ""}
							</Text>
						</View>
					)}
				</View>
			</View>

			<View className="h-px mx-6 mb-2 bg-zinc-800" />

			{/* Create button */}
			<Pressable
				onPress={openCreate}
				className="flex-row items-center justify-center mx-6 mt-2 mb-4 py-3 bg-emerald-500 rounded-2xl active:scale-[0.98]"
			>
				<Text className="mr-2 text-base">➕</Text>
				<Text className="text-sm font-bold text-zinc-950">New Collection</Text>
			</Pressable>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-zinc-500">Loading…</Text>
				</View>
			) : collections.length === 0 ? (
				<View className="flex-1 items-center justify-center px-8">
					<View className="items-center justify-center w-24 h-24 mb-6 rounded-full bg-zinc-900 border-2 border-zinc-800">
						<Text className="text-5xl">🗂️</Text>
					</View>
					<Text className="mb-2 text-xl font-black text-center text-white">
						No collections yet
					</Text>
					<Text className="text-sm leading-6 text-center text-zinc-500">
						Create a collection to organise your favourite meals into named
						lists like{" "}
						<Text className="text-emerald-400 font-semibold">
							"Quick Dinners"
						</Text>{" "}
						or{" "}
						<Text className="text-emerald-400 font-semibold">"Date Night"</Text>
						.
					</Text>
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
					renderItem={({ item }) => (
						<CollectionCard
							collection={item}
							onPress={() => openView(item)}
							onRename={() => openRename(item)}
							onDelete={() => handleDelete(item)}
						/>
					)}
				/>
			)}
		</SafeAreaView>
	);
}
