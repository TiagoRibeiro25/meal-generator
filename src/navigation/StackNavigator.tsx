import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FavouritesScreen } from "../screens/FavouritesScreen";
import { FilterScreen } from "../screens/FilterScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MealScreen } from "../screens/MealScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { Meal } from "../types/Meal";

export type RootStackParamList = {
	Home: undefined;
	Meal: { meal: Meal };
	Filters: undefined;
	Search: undefined;
	Favourites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function StackNavigator() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Home" component={HomeScreen} />
			<Stack.Screen name="Meal" component={MealScreen} />
			<Stack.Screen name="Filters" component={FilterScreen} />
			<Stack.Screen name="Search" component={SearchScreen} />
			<Stack.Screen name="Favourites" component={FavouritesScreen} />
		</Stack.Navigator>
	);
}
