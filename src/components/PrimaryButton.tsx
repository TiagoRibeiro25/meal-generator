import { Pressable, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
};

export function PrimaryButton({ title, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="py-4 rounded-2xl bg-emerald-500 active:scale-95"
    >
      <Text className="text-lg font-bold text-center text-zinc-900">
        {title}
      </Text>
    </Pressable>
  );
}
