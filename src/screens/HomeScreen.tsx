import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { RootStackParamList } from "../navigation/StackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
	return (
		<View className="justify-center flex-1 px-6 bg-zinc-950">
			<Text className="text-4xl font-extrabold text-white">🍽️ Random Meal</Text>

			<Text className="mt-3 text-lg leading-6 text-zinc-400">
				Feeling hungry but out of ideas? Tap the button below and discover a random
				delicious meal.
			</Text>

			<View className="mt-10">
				<PrimaryButton
					title="Browse by Category"
					onPress={() => navigation.navigate("Filters")}
				/>
			</View>
		</View>
	);
}
