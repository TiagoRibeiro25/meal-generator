import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string) => void;
  vertical?: boolean;
};

export function CategoryFilter({ categories, selectedCategory, onSelect, vertical = false }: Props) {
  if (vertical) {
    // Vertical layout → larger tap targets
    return (
      <View className="px-4 mt-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => onSelect(cat)}
              className={`px-4 py-3 mb-2 rounded-full ${
                isSelected ? "bg-emerald-500" : "bg-zinc-800"
              } flex-none`} // flex-none prevents stretching
            >
              <Text className={`font-semibold ${isSelected ? "text-zinc-900" : "text-white"}`}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Horizontal layout → compact buttons
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
            } flex-none items-center justify-center`} // important for horizontal
          >
            <Text className={`font-semibold ${isSelected ? "text-zinc-900" : "text-white"}`}>
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
