import { Text, View } from "react-native";

type Props = {
	className?: string;
};

export function OfflineBadge({ className = "" }: Props) {
	return (
		<View
			className={`self-start px-3 py-1 rounded-full bg-blue-500 ${className}`}
		>
			<Text className="text-xs font-semibold text-white">
				📥 Available offline
			</Text>
		</View>
	);
}
