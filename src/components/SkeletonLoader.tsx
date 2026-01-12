import { useEffect, useRef } from "react";
import { Animated } from "react-native";

type Props = {
	width?: number | `${number}%`;
	height?: number | `${number}%`;
	borderRadius?: number;
	className?: string;
};

export function SkeletonLoader({
	width = "100%",
	height = 20,
	borderRadius = 8,
	className = "",
}: Props) {
	const opacity = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		);
		animation.start();
		return () => animation.stop();
	}, [opacity]);

	return (
		<Animated.View
			style={{ opacity, width, height, borderRadius }}
			className={`bg-zinc-800 ${className}`}
		/>
	);
}
