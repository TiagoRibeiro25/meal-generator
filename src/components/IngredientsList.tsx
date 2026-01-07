import { Text, View } from "react-native";

type Props = {
  ingredients: { ingredient: string; measure: string }[];
};

export function IngredientsList({ ingredients }: Props) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-xl font-bold text-white">Ingredients</Text>
      {ingredients.map((item, index) =>
        item.ingredient ? (
          <Text key={index} className="leading-6 text-zinc-300">
            • {item.measure} {item.ingredient}
          </Text>
        ) : null
      )}
    </View>
  );
}
