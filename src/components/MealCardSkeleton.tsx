import { View } from "react-native";
import { SkeletonLoader } from "./SkeletonLoader";

export function MealCardSkeleton() {
  return (
    <View className="mb-4 overflow-hidden bg-zinc-900 rounded-2xl">
      <SkeletonLoader height={160} borderRadius={0} />
      <View className="p-4">
        <SkeletonLoader width="80%" height={24} className="mb-2" />
        <SkeletonLoader width="40%" height={16} />
      </View>
    </View>
  );
}
