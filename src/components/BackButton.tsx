import { useNavigation } from "@react-navigation/native";
import { Pressable, Text, View } from "react-native";

export function BackButton() {
	const navigation = useNavigation();
	return (
		<Pressable
			onPress={() => navigation.goBack()}
			className="self-start mb-4 active:scale-95"
		>
			<View className="flex-row items-center px-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-700">
				<Text className="mr-1.5 text-sm text-zinc-400">‹</Text>
				<Text className="text-sm font-semibold text-zinc-300">Back</Text>
			</View>
		</Pressable>
	);
}
