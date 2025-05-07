import dbPromise, { OBJECT_STORE_NAME } from "./idb";

const addStory = async (story) => {
  const db = await dbPromise;
  await db.put(OBJECT_STORE_NAME, story);
};

const getAllStories = async () => {
  const db = await dbPromise;
  return db.getAll(OBJECT_STORE_NAME);
};

const deleteStory = async (id) => {
  const db = await dbPromise;
  await db.delete(OBJECT_STORE_NAME, id);
};

export { addStory, getAllStories, deleteStory };
