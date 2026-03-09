import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_KEY = "@meal_notes";

type NotesMap = Record<string, string>;

async function getNotesMap(): Promise<NotesMap> {
	try {
		const json = await AsyncStorage.getItem(NOTES_KEY);
		return json ? JSON.parse(json) : {};
	} catch (e) {
		console.error("Error reading notes:", e);
		return {};
	}
}

async function saveNotesMap(map: NotesMap): Promise<void> {
	try {
		await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(map));
	} catch (e) {
		console.error("Error saving notes:", e);
	}
}

export async function getNote(mealId: string): Promise<string> {
	const map = await getNotesMap();
	return map[mealId] ?? "";
}

export async function saveNote(mealId: string, note: string): Promise<void> {
	const map = await getNotesMap();
	if (note.trim()) {
		map[mealId] = note.trim();
	} else {
		delete map[mealId];
	}
	await saveNotesMap(map);
}

export async function deleteNote(mealId: string): Promise<void> {
	const map = await getNotesMap();
	delete map[mealId];
	await saveNotesMap(map);
}

export async function hasNote(mealId: string): Promise<boolean> {
	const map = await getNotesMap();
	return Boolean(map[mealId]?.trim());
}

export async function getAllNotes(): Promise<NotesMap> {
	return getNotesMap();
}

export async function getNoteCount(): Promise<number> {
	const map = await getNotesMap();
	return Object.keys(map).length;
}
