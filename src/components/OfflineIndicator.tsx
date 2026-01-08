import { Text, View } from "react-native";

export function OfflineIndicator() {
  return (
    <View className="px-4 py-2 bg-red-500">
      <Text className="font-semibold text-center text-white">
        ⚠️ No Internet Connection
      </Text>
    </View>
  );
}