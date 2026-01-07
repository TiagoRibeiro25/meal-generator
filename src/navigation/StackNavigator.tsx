import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FilterScreen } from "../screens/FilterScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MealScreen } from "../screens/MealScreen";
import { Meal } from "../types/Meal";

export type RootStackParamList = {
	Home: undefined;
	Meal: { meal: Meal };
	Filters: undefined; // New screen
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function StackNavigator() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Home" component={HomeScreen} />
			<Stack.Screen name="Meal" component={MealScreen} />
			<Stack.Screen name="Filters" component={FilterScreen} />
		</Stack.Navigator>
	);
}
