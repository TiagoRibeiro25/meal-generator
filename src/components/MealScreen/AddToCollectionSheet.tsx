import { useCallback, useEffect, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	Collection,
	addMealToCollection,
	getCollections,
	getCollectionsForMeal,
} from "../../services/collectionsService";
import { Meal } from "../../types/Meal";

type Props = {
	visible: boolean;
	meal: Meal;
	onClose: () => void;
};

export function AddToCollectionSheet({ visible, meal, onClose }: Props) {
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
			console.error("[AddToCollectionSheet] Failed to load collections:", e);
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
				console.error("[AddToCollectionSheet] Failed to add to collection:", e);
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
						contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
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
									<View className="items-center justify-center w-11 h-11 mr-4 rounded-xl bg-zinc-800">
										<Text className="text-2xl">{item.emoji}</Text>
									</View>

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
