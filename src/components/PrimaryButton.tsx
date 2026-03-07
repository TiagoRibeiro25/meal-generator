import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
	title: string;
	onPress: () => void;
	icon?: string;
	variant?: "primary" | "secondary" | "danger";
	loading?: boolean;
	disabled?: boolean;
};

export function PrimaryButton({
	title,
	onPress,
	icon,
	variant = "primary",
	loading = false,
	disabled = false,
}: Props) {
	const isDisabled = disabled || loading;

	const containerStyle = {
		primary: "bg-emerald-500 border-2 border-emerald-500",
		secondary: "bg-transparent border-2 border-zinc-700",
		danger: "bg-red-500/15 border-2 border-red-500/40",
	}[variant];

	const textStyle = {
		primary: "text-zinc-950",
		secondary: "text-white",
		danger: "text-red-400",
	}[variant];

	const iconBgStyle = {
		primary: "bg-emerald-600",
		secondary: "bg-zinc-700",
		danger: "bg-red-500/20",
	}[variant];

	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			className={`w-full rounded-2xl active:scale-[0.98] ${containerStyle} ${
				isDisabled ? "opacity-50" : "opacity-100"
			}`}
		>
			<View className="flex-row items-center justify-center px-6 py-4">
				{loading ? (
					<ActivityIndicator
						size="small"
						color={variant === "primary" ? "#09090b" : "#ffffff"}
						className="mr-3"
					/>
				) : (
					icon && (
						<View
							className={`items-center justify-center w-8 h-8 mr-3 rounded-xl ${iconBgStyle}`}
						>
							<Text className="text-base">{icon}</Text>
						</View>
					)
				)}
				<Text className={`text-base font-bold ${textStyle}`}>
					{loading ? "Loading…" : title}
				</Text>
			</View>
		</Pressable>
	);
}
