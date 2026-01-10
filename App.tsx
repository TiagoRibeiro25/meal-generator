import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { StackNavigator } from "./src/navigation/StackNavigator";
import { clearOldCache } from "./src/services/cacheService";

export default function App() {
	useEffect(() => {
		clearOldCache();
	}, []);

	return (
		<ErrorBoundary>
			<SafeAreaProvider>
				<NavigationContainer>
					<StackNavigator />
				</NavigationContainer>
			</SafeAreaProvider>
		</ErrorBoundary>
	);
}
