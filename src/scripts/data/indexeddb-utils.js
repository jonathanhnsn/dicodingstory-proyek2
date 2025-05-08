import { openDB } from "idb";

const DATABASE_NAME = "dicoding-story-db";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "bookmarks";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
    }
  },
});

const BookmarkDB = {
  async get(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAll() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async put(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async delete(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default BookmarkDB;
