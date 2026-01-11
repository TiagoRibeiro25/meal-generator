import { Pressable, TextInput, View } from "react-native";

type Props = {
  index: number;
  ingredient: string;
  measure: string;
  onChange: (index: number, ingredient: string, measure: string) => void;
  onRemove: (index: number) => void;
};

export function AddIngredientInput({ index, ingredient, measure, onChange, onRemove }: Props) {
  return (
    <View className="flex-row items-center mb-2">
      <TextInput
        value={ingredient}
        onChangeText={(t) => onChange(index, t, measure)}
        placeholder="Ingredient"
        placeholderTextColor="#9ca3af"
        className="flex-1 px-3 py-2 mr-2 text-white rounded bg-zinc-800"
      />
      <TextInput
        value={measure}
        onChangeText={(t) => onChange(index, ingredient, t)}
        placeholder="Measure"
        placeholderTextColor="#9ca3af"
        className="w-24 px-3 py-2 mr-2 text-white rounded bg-zinc-800"
      />
      <Pressable onPress={() => onRemove(index)} className="px-3 py-2 bg-red-500 rounded">
        <View>
          <View>
            <View />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
