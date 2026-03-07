import { Pressable, Text, View } from "react-native";

type Props = {
	onRetry?: () => void;
	message?: string;
};

export function NetworkError({ onRetry, message }: Props) {
	return (
		<View className="items-center justify-center flex-1 px-8 bg-zinc-950">
			{/* Icon container */}
			<View className="items-center justify-center w-28 h-28 mb-6 rounded-full bg-zinc-900 border-2 border-zinc-800">
				<Text className="text-5xl">📡</Text>
			</View>

			{/* Title */}
			<Text
				className="mb-3 text-2xl font-black text-center text-white"
				style={{ letterSpacing: -0.5 }}
			>
				Connection Error
			</Text>

			{/* Message */}
			<Text className="mb-8 text-sm leading-6 text-center text-zinc-500">
				{message ||
					"Unable to reach the server.\nPlease check your connection and try again."}
			</Text>

			{/* Divider */}
			<View className="w-12 h-px mb-8 rounded-full bg-zinc-800" />

			{/* Retry button */}
			{onRetry && (
				<Pressable
					onPress={onRetry}
					className="flex-row items-center justify-center px-8 py-4 bg-emerald-500 rounded-2xl active:scale-[0.97]"
				>
					<Text className="mr-2 text-base">↺</Text>
					<Text className="text-base font-bold text-zinc-950">Try Again</Text>
				</Pressable>
			)}

			{/* Hint */}
			<Text className="mt-6 text-xs text-center text-zinc-600">
				Previously cached content may still be available
			</Text>
		</View>
	);
}
