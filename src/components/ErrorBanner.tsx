import { Text, View } from "react-native";

type Props = {
	message: string;
	type?: "error" | "warning" | "info";
};

export function ErrorBanner({ message, type = "error" }: Props) {
	const bgColor = {
		error: "bg-red-500",
		warning: "bg-yellow-500",
		info: "bg-blue-500",
	}[type];

	return (
		<View className={`px-4 py-3 mx-6 mb-4 rounded-xl ${bgColor}`}>
			<Text className="font-semibold text-center text-white">{message}</Text>
		</View>
	);
}
