import ApiService from "../../../scripts/data/api";
import Auth from "../../utils/auth";
import BookmarkDB from "../../data/indexeddb-utils";

class StoryDetailPresenter {
  #view = null;
  #api = null;
  #auth = null;
  #storyId = null;

  constructor({ view, storyId, api = ApiService, auth = Auth }) {
    this.#view = view;
    this.#storyId = storyId;
    this.#api = api;
    this.#auth = auth;

    this._initialState = {
      story: null,
      loading: false,
      error: null,
      isBookmarked: false,
    };

    this._state = { ...this._initialState };
  }

  init() {
    this._resetState();

    if (!this.#auth.isAuthenticated()) {
      this.#view.showUnauthenticatedState();
      return;
    }

    if (!this.#storyId) {
      this.#view.showError("ID cerita tidak ditemukan");
      return;
    }

    this._fetchStoryDetail();
  }

  _resetState() {
    this._state = { ...this._initialState };
  }

  async _fetchStoryDetail() {
    this._state.loading = true;
    this.#view.showLoading();

    try {
      const bookmarked = await BookmarkDB.get(this.#storyId);
      this._state.isBookmarked = !!bookmarked;

      let storyData;

      if (bookmarked) {
        storyData = bookmarked;
      } else {
        const token = this.#auth.getToken();
        const response = await this.#api.getStoryDetail(token, this.#storyId);
        if (response.error) {
          throw new Error(response.message);
        }
        storyData = response.story;
      }

      this._state.story = storyData;
      this.#view.showStoryDetail(this._state.story, this._state.isBookmarked);

      if (this._state.story.lat && this._state.story.lon) {
        this.#view.initMap(this._state.story);
      }
    } catch (error) {
      this._state.error = error.message;
      this.#view.showError(error.message);
    } finally {
      this._state.loading = false;
    }
  }

  async toggleBookmark() {
    const story = this._state.story;

    if (!story) return;
    try {
      const existing = await BookmarkDB.get(story.id);
      if (existing) {
        await BookmarkDB.delete(story.id);
        this._state.isBookmarked = false;
      } else {
        await BookmarkDB.put(story);
        this._state.isBookmarked = true;
      }

      this.#view.updateBookmarkButton(this._state.isBookmarked);
      this.#view.showBookmarkNotification(this._state.isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      this.#view.showError("Gagal menyimpan cerita");
    }
  }

  isAuthenticated() {
    return this.#auth.isAuthenticated();
  }
}

export default StoryDetailPresenter;
