import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
	categories: string[];
	selectedCategory: string | null;
	onSelect: (category: string) => void;
	vertical?: boolean; // layout mode
};

export function CategoryFilter({
	categories,
	selectedCategory,
	onSelect,
	vertical = false,
}: Props) {
	if (vertical) {
		return (
			<ScrollView className="px-4 mt-4 mb-4" showsVerticalScrollIndicator>
				{categories.map((cat) => {
					const isSelected = selectedCategory === cat;
					return (
						<Pressable
							key={cat}
							onPress={() => onSelect(cat)}
							className={`px-4 py-3 mb-3 rounded-full ${
								isSelected ? "bg-emerald-500" : "bg-zinc-800"
							} flex-none`}
						>
							<Text
								className={`font-semibold text-center ${isSelected ? "text-zinc-900" : "text-white"}`}
							>
								{cat}
							</Text>
						</Pressable>
					);
				})}

				{/* Invisible spacer at the bottom so last item isn't stuck */}
				<View style={{ height: 60 }} />
			</ScrollView>
		);
	}

	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 my-4">
			{categories.map((cat) => {
				const isSelected = selectedCategory === cat;
				return (
					<Pressable
						key={cat}
						onPress={() => onSelect(cat)}
						className={`px-4 py-1 mr-2 rounded-full ${
							isSelected ? "bg-emerald-500" : "bg-zinc-800"
						} flex-none items-center justify-center`}
					>
						<Text
							className={`font-semibold ${isSelected ? "text-zinc-900" : "text-white"}`}
						>
							{cat}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}
