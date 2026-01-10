import { Pressable, Text, View } from "react-native";

type Props = {
  onRetry?: () => void;
  message?: string;
};

export function NetworkError({ onRetry, message }: Props) {
  return (
    <View className="items-center justify-center flex-1 px-6 bg-zinc-950">
      <Text className="mb-2 text-6xl">📡</Text>
      <Text className="mb-2 text-2xl font-bold text-center text-white">
        Connection Error
      </Text>
      <Text className="mb-6 text-center text-zinc-400">
        {message || "Unable to connect to the internet. Please check your connection and try again."}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="px-6 py-3 rounded-xl bg-emerald-500"
        >
          <Text className="font-bold text-white">Retry</Text>
        </Pressable>
      )}
    </View>
  );
}
