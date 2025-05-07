import { openDB } from "idb";

let dbPromise;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB("story-database", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("stories")) {
          db.createObjectStore("stories", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllStories() {
  const db = await getDb();
  return db.getAll("stories");
}

export async function saveStory(story) {
  const db = await getDb();
  return db.put("stories", story);
}

export async function saveStories(stories) {
  const db = await getDb();
  const tx = db.transaction("stories", "readwrite");
  for (const story of stories) {
    await tx.store.put(story);
  }
  await tx.done;
}

export async function clearStories() {
  const db = await getDb();
  const tx = db.transaction("stories", "readwrite");
  await tx.store.clear();
  await tx.done;
}
