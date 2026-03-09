import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "../types/Meal";

export const MEAL_PLAN_KEY = "@meal_plan";

export type DayOfWeek =
	| "Monday"
	| "Tuesday"
	| "Wednesday"
	| "Thursday"
	| "Friday"
	| "Saturday"
	| "Sunday";

export const DAYS_OF_WEEK: DayOfWeek[] = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export type MealSlot = "breakfast" | "lunch" | "dinner";

export const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];

export type DayPlan = {
	[slot in MealSlot]?: Meal;
};

export type WeeklyMealPlan = {
	[day in DayOfWeek]: DayPlan;
};

function emptyPlan(): WeeklyMealPlan {
	return DAYS_OF_WEEK.reduce((acc, day) => {
		acc[day] = {};
		return acc;
	}, {} as WeeklyMealPlan);
}

export async function getMealPlan(): Promise<WeeklyMealPlan> {
	try {
		const json = await AsyncStorage.getItem(MEAL_PLAN_KEY);
		if (!json) return emptyPlan();
		const parsed = JSON.parse(json) as Partial<WeeklyMealPlan>;
		// Merge with empty plan to ensure all days are present
		return { ...emptyPlan(), ...parsed };
	} catch (e) {
		console.error("Error getting meal plan:", e);
		return emptyPlan();
	}
}

export async function setMealForSlot(
	day: DayOfWeek,
	slot: MealSlot,
	meal: Meal,
): Promise<void> {
	try {
		const plan = await getMealPlan();
		plan[day] = { ...plan[day], [slot]: meal };
		await AsyncStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
	} catch (e) {
		console.error("Error setting meal for slot:", e);
	}
}

export async function removeMealFromSlot(
	day: DayOfWeek,
	slot: MealSlot,
): Promise<void> {
	try {
		const plan = await getMealPlan();
		const dayPlan = { ...plan[day] };
		delete dayPlan[slot];
		plan[day] = dayPlan;
		await AsyncStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
	} catch (e) {
		console.error("Error removing meal from slot:", e);
	}
}

export async function clearDayPlan(day: DayOfWeek): Promise<void> {
	try {
		const plan = await getMealPlan();
		plan[day] = {};
		await AsyncStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
	} catch (e) {
		console.error("Error clearing day plan:", e);
	}
}

export async function clearMealPlan(): Promise<void> {
	try {
		await AsyncStorage.removeItem(MEAL_PLAN_KEY);
	} catch (e) {
		console.error("Error clearing meal plan:", e);
	}
}

export function countPlannedMeals(plan: WeeklyMealPlan): number {
	return DAYS_OF_WEEK.reduce((total, day) => {
		return total + Object.values(plan[day]).filter(Boolean).length;
	}, 0);
}
