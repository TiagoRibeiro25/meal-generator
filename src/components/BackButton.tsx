import { useNavigation } from "@react-navigation/native";
import { Pressable, Text } from "react-native";

export function BackButton() {
	const navigation = useNavigation();
	return (
		<Pressable
			onPress={() => navigation.goBack()}
			className="self-start px-4 py-2 mb-4 rounded-full bg-zinc-800 active:scale-95"
		>
			<Text className="text-lg font-semibold text-white">← Back</Text>
		</Pressable>
	);
}
