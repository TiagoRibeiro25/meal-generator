import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

type Props = {
	visible: boolean;
	uri: string;
	onClose: () => void;
};

export function FullscreenImageViewer({ visible, uri, onClose }: Props) {
	const [loading, setLoading] = useState(true);

	return (
		<Modal visible={visible} transparent animationType="fade">
			<View className="flex-1 bg-black">
				<Pressable
					onPress={onClose}
					className="absolute z-10 px-3 py-2 rounded top-10 left-4 bg-black/40"
				>
					<Text className="text-lg text-white">Close</Text>
				</Pressable>

				<ScrollView
					contentContainerStyle={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
					}}
					maximumZoomScale={3}
					minimumZoomScale={1}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
				>
					<Image
						source={{ uri }}
						style={{ width: "100%", height: "100%", resizeMode: "contain" }}
						onLoadEnd={() => setLoading(false)}
					/>
				</ScrollView>

				{loading && (
					<ActivityIndicator
						size="large"
						color="#ffffff"
						style={{ position: "absolute", top: "50%", left: "50%", marginLeft: -18 }}
					/>
				)}
			</View>
		</Modal>
	);
}
