export const CACHE_EXPIRY_DAYS = 30;
export const CACHE_EXPIRY_MS = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export const CACHE_PREFIX = "@meal_cache_";
export const CACHE_INDEX_KEY = "@meal_cache_index";

export const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const RECENT_KEY = "@recent_meals";
export const FAVOURITES_KEY = "@meal_favourites";
export const CUSTOM_MEALS_KEY = "@custom_meals";
export const COLLECTIONS_KEY = "@meal_collections";

export const MAX_RECENT = 10;

export const SKELETON_ITEMS = 5;
export const INITIAL_NUM_TO_RENDER = 10;
export const MAX_TO_RENDER_PER_BATCH = 10;
export const WINDOW_SIZE = 21;

export type NavTile = {
	icon: string;
	label: string;
	description: string;
	screen: string;
	accent: string;
	accentText: string;
	primary?: boolean;
};

export const NAV_TILES: NavTile[] = [
	{
		icon: "🔍",
		label: "Browse Categories",
		description: "Explore meals by cuisine type",
		screen: "Filters",
		accent: "bg-emerald-500",
		accentText: "text-zinc-950",
		primary: true,
	},
	{
		icon: "🔎",
		label: "Search Recipes",
		description: "Find any dish by name",
		screen: "Search",
		accent: "bg-cyan-500",
		accentText: "text-zinc-950",
		primary: true,
	},
	{
		icon: "🔥",
		label: "Daily Challenge",
		description: "Cook something new every day",
		screen: "DailyChallenge",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "🗂️",
		label: "Collections",
		description: "Organise meals into named lists",
		screen: "Collections",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "📊",
		label: "Your Kitchen",
		description: "Stats, progress & overview",
		screen: "Stats",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "📅",
		label: "Meal Planner",
		description: "Plan your week ahead",
		screen: "MealPlanner",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "🛒",
		label: "Shopping List",
		description: "Ingredients from your meals",
		screen: "ShoppingList",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "❤️",
		label: "My Favourites",
		description: "Saved meals you love",
		screen: "Favourites",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "📚",
		label: "My Meals",
		description: "Your custom recipe collection",
		screen: "MyMeals",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
	{
		icon: "➕",
		label: "Add Custom Meal",
		description: "Create your own recipe",
		screen: "AddMeal",
		accent: "bg-zinc-800",
		accentText: "text-white",
	},
];
