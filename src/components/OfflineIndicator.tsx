import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export function OfflineIndicator() {
	const translateY = useRef(new Animated.Value(-40)).current;
	const opacity = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.spring(translateY, {
				toValue: 0,
				useNativeDriver: true,
				damping: 18,
				stiffness: 180,
			}),
			Animated.timing(opacity, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}),
		]).start();
	}, [opacity, translateY]);

	return (
		<Animated.View
			style={{ transform: [{ translateY }], opacity }}
			className="px-4 py-2 bg-zinc-900 border-b border-zinc-800"
		>
			<View className="flex-row items-center justify-center gap-2">
				<View className="w-2 h-2 rounded-full bg-red-500" />
				<Text className="text-sm font-semibold text-zinc-300">
					No Internet Connection
				</Text>
				<Text className="text-xs text-zinc-500">· Showing cached content</Text>
			</View>
		</Animated.View>
	);
}
