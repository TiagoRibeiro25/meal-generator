import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { StackNavigator } from "./src/navigation/StackNavigator";
import { clearOldCache } from "./src/services/cacheService";

export default function App() {
	useEffect(() => {
		// Clear cache older than 30 days on app start
		clearOldCache();
	}, []);

	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<StackNavigator />
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
