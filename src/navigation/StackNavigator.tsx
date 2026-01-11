import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AddMealScreen } from "../screens/AddMealScreen";
import { FavouritesScreen } from "../screens/FavouritesScreen";
import { FilterScreen } from "../screens/FilterScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MealScreen } from "../screens/MealScreen";
import { MyMealsScreen } from "../screens/MyMealsScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { Meal } from "../types/Meal";

export type RootStackParamList = {
	Home: undefined;
	Meal: { meal: Meal };
	Filters: undefined;
	Search: undefined;
	Favourites: undefined;
	AddMeal: { meal?: Meal } | undefined;
	MyMeals: undefined;
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
			<Stack.Screen name="AddMeal" component={AddMealScreen} />
			<Stack.Screen name="MyMeals" component={MyMealsScreen} />
		</Stack.Navigator>
	);
}
