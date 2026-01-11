import * as FileSystem from "expo-file-system/legacy";

export async function persistImage(uri: string | null | undefined, id: string): Promise<string | null> {
  if (!uri) return null;

  try {
    const doc = FileSystem.documentDirectory || "";
    // already stored
    if (uri.startsWith(doc)) return uri;

    const dir = `${doc}meal_images/`;
    try {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    } catch (e) {
      // ignore
    }

    const ext = uri.split(".").pop()?.split("?")[0] || "jpg";
    const dest = `${dir}${id}.${ext}`;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (e) {
      console.error("persistImage copy failed, returning original uri", e);
      return uri;
    }
  } catch (e) {
    console.error("persistImage error", e);
    return uri;
  }
}

export async function deleteLocalImageIfExists(uri: string | undefined | null): Promise<void> {
  if (!uri) return;
  try {
    const doc = FileSystem.documentDirectory || "";
    if (!uri.startsWith(doc)) return;
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (e) {
    console.error("deleteLocalImageIfExists error", e);
  }
}

export function isLocalImage(uri: string | undefined | null): boolean {
  if (!uri) return false;
  const doc = FileSystem.documentDirectory || "";
  return uri.startsWith(doc);
}
