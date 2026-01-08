import { Share } from "react-native";
import { Meal } from "../types/Meal";

export async function shareMeal(meal: Meal): Promise<void> {
	try {
		const link = meal.strSource || meal.strYoutube || "";
		const message = link
			? `🍽️ ${meal.strMeal}\n\nCheck out this recipe:\n${link}`
			: `🍽️ ${meal.strMeal}\n\nDelicious ${meal.strCategory} recipe from ${meal.strArea}`;

		await Share.share({
			message,
		});
	} catch (error) {
		console.error("Error sharing meal:", error);
	}
}
