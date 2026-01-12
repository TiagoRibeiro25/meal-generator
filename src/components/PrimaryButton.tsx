import { Pressable, Text, View } from "react-native";

type Props = {
	title: string;
	onPress: () => void;
	icon?: string;
	variant?: "primary" | "secondary";
};

export function PrimaryButton({
	title,
	onPress,
	icon,
	variant = "primary",
}: Props) {
	const isPrimary = variant === "primary";

	return (
		<Pressable
			onPress={onPress}
			className={`py-5 px-6 rounded-3xl active:scale-[0.98] ${
				isPrimary ? "bg-emerald-500" : "bg-zinc-800 border-2 border-zinc-700"
			}`}
		>
			<View className="flex-row items-center justify-center">
				{icon && <Text className="mr-3 text-2xl">{icon}</Text>}
				<Text
					className={`text-lg font-bold ${isPrimary ? "text-zinc-900" : "text-white"}`}
				>
					{title}
				</Text>
			</View>
		</Pressable>
	);
}
