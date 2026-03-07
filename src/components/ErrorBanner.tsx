import { Text, View } from "react-native";

type Props = {
	message: string;
	type?: "error" | "warning" | "info";
};

const CONFIG = {
	error: {
		container: "bg-red-500/10 border border-red-500/30",
		text: "text-red-400",
		dot: "bg-red-500",
		icon: "⚠️",
	},
	warning: {
		container: "bg-yellow-500/10 border border-yellow-500/30",
		text: "text-yellow-400",
		dot: "bg-yellow-500",
		icon: "⚡",
	},
	info: {
		container: "bg-blue-500/10 border border-blue-500/30",
		text: "text-blue-400",
		dot: "bg-blue-500",
		icon: "ℹ️",
	},
} as const;

export function ErrorBanner({ message, type = "error" }: Props) {
	const { container, text, dot, icon } = CONFIG[type];

	return (
		<View
			className={`flex-row items-start px-4 py-3 mx-6 mb-4 rounded-2xl ${container}`}
		>
			<View className={`w-2 h-2 rounded-full mt-1.5 mr-3 shrink-0 ${dot}`} />
			<Text className={`flex-1 text-sm font-semibold leading-5 ${text}`}>
				{icon} {message}
			</Text>
		</View>
	);
}
