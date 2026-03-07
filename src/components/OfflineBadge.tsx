import { Text, View } from "react-native";

type Props = {
	className?: string;
};

export function OfflineBadge({ className = "" }: Props) {
	return (
		<View
			className={`self-start flex-row items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 ${className}`}
		>
			<View className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2" />
			<Text className="text-xs font-semibold text-blue-400">
				Available offline
			</Text>
		</View>
	);
}
