import { Image, Pressable, Text, View } from "react-native";
import { Meal } from "../types/Meal";

type Props = {
  meal: Meal;
  onPress: () => void;
};

export function MealCard({ meal, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden shadow-lg bg-zinc-900 rounded-2xl"
    >
      <Image source={{ uri: meal.strMealThumb }} className="w-full h-40" resizeMode="cover" />
      <View className="p-4">
        <Text className="text-lg font-bold text-white">{meal.strMeal}</Text>
        <Text className="mt-1 text-zinc-400">{meal.strCategory}</Text>
      </View>
    </Pressable>
  );
}
