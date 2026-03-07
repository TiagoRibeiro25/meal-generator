import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
	categories: string[];
	selectedCategory: string | null;
	onSelect: (category: string) => void;
	vertical?: boolean;
};

export function CategoryFilter({
	categories,
	selectedCategory,
	onSelect,
	vertical = false,
}: Props) {
	if (vertical) {
		return (
			<ScrollView
				className="mt-3 mb-4"
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View className="flex-row flex-wrap gap-2 px-6">
					{categories.map((cat) => {
						const isSelected = selectedCategory === cat;
						return (
							<Pressable
								key={cat}
								onPress={() => onSelect(cat)}
								className={`px-4 py-2.5 rounded-full border active:scale-[0.97] ${
									isSelected
										? "bg-emerald-500 border-emerald-500"
										: "bg-zinc-900 border-zinc-700"
								}`}
							>
								<Text
									className={`text-sm font-semibold ${
										isSelected ? "text-zinc-950" : "text-zinc-300"
									}`}
								>
									{cat}
								</Text>
							</Pressable>
						);
					})}
				</View>

				{/* Bottom spacer so last row isn't cut off */}
				<View style={{ height: 120 }} />
			</ScrollView>
		);
	}

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12 }}
			keyboardShouldPersistTaps="handled"
		>
			{categories.map((cat) => {
				const isSelected = selectedCategory === cat;
				return (
					<Pressable
						key={cat}
						onPress={() => onSelect(cat)}
						className={`mr-2 px-4 py-2.5 rounded-full border flex-none active:scale-[0.97] ${
							isSelected
								? "bg-emerald-500 border-emerald-500"
								: "bg-zinc-900 border-zinc-700"
						}`}
					>
						<Text
							className={`text-sm font-semibold ${
								isSelected ? "text-zinc-950" : "text-zinc-300"
							}`}
						>
							{cat}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}
