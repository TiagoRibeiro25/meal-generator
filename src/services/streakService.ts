import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "@cooking_streak";

export type StreakData = {
	currentStreak: number;
	longestStreak: number;
	lastCompletedDate: string | null; // ISO date string "YYYY-MM-DD"
	totalCooked: number;
	dailyChallengeId: string | null;
	dailyChallengeDate: string | null; // ISO date string "YYYY-MM-DD"
};

const EMPTY_STREAK: StreakData = {
	currentStreak: 0,
	longestStreak: 0,
	lastCompletedDate: null,
	totalCooked: 0,
	dailyChallengeId: null,
	dailyChallengeDate: null,
};

function todayString(): string {
	return new Date().toISOString().split("T")[0];
}

function yesterdayString(): string {
	const d = new Date();
	d.setDate(d.getDate() - 1);
	return d.toISOString().split("T")[0];
}

export async function getStreakData(): Promise<StreakData> {
	try {
		const json = await AsyncStorage.getItem(STREAK_KEY);
		if (!json) return { ...EMPTY_STREAK };
		return { ...EMPTY_STREAK, ...JSON.parse(json) };
	} catch (e) {
		console.error("Error reading streak:", e);
		return { ...EMPTY_STREAK };
	}
}

async function saveStreakData(data: StreakData): Promise<void> {
	try {
		await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
	} catch (e) {
		console.error("Error saving streak:", e);
	}
}

/** Returns true if today's challenge has already been completed. */
export async function isTodayCompleted(): Promise<boolean> {
	const data = await getStreakData();
	return data.lastCompletedDate === todayString();
}

/**
 * Marks today's challenge as completed.
 * Increments streak if yesterday was the last completion, resets to 1 otherwise.
 * Returns the updated StreakData.
 */
export async function completeChallenge(): Promise<StreakData> {
	const data = await getStreakData();
	const today = todayString();

	// Already completed today — return as-is
	if (data.lastCompletedDate === today) return data;

	const newStreak =
		data.lastCompletedDate === yesterdayString()
			? data.currentStreak + 1
			: 1;

	const updated: StreakData = {
		...data,
		currentStreak: newStreak,
		longestStreak: Math.max(newStreak, data.longestStreak),
		lastCompletedDate: today,
		totalCooked: data.totalCooked + 1,
	};

	await saveStreakData(updated);
	return updated;
}

/**
 * Saves the daily challenge meal ID for today.
 * If a challenge is already set for today, does nothing.
 */
export async function setDailyChallenge(mealId: string): Promise<void> {
	const data = await getStreakData();
	const today = todayString();

	if (data.dailyChallengeDate === today) return;

	await saveStreakData({
		...data,
		dailyChallengeId: mealId,
		dailyChallengeDate: today,
	});
}

/**
 * Returns true if the streak is still alive today
 * (completed today or yesterday).
 */
export async function isStreakAlive(): Promise<boolean> {
	const data = await getStreakData();
	if (data.currentStreak === 0) return false;
	const today = todayString();
	const yesterday = yesterdayString();
	return (
		data.lastCompletedDate === today ||
		data.lastCompletedDate === yesterday
	);
}

/** Resets the entire streak (useful for testing or user opt-out). */
export async function resetStreak(): Promise<void> {
	await saveStreakData({ ...EMPTY_STREAK });
}
