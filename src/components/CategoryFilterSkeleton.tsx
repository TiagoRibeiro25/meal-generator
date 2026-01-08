import { ScrollView, View } from "react-native";
import { SkeletonLoader } from "./SkeletonLoader";

type Props = {
  vertical?: boolean;
};

export function CategoryFilterSkeleton({ vertical = false }: Props) {
  if (vertical) {
    return (
      <View className="px-4 mt-4 mb-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonLoader key={i} height={48} className="mb-3" borderRadius={24} />
        ))}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 my-4">
      {[...Array(6)].map((_, i) => (
        <SkeletonLoader
          key={i}
          width={100}
          height={36}
          borderRadius={24}
          className="mr-2"
        />
      ))}
    </ScrollView>
  );
}
