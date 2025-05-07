import ApiService from "../../../scripts/data/api";
import Auth from "../../utils/auth";

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
      const token = this.#auth.getToken();
      const response = await this.#api.getStoryDetail(token, this.#storyId);

      if (response.error) {
        throw new Error(response.message);
      }

      this._state.story = response.story;
      this.#view.showStoryDetail(this._state.story);

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

  isAuthenticated() {
    return this.#auth.isAuthenticated();
  }
}

export default StoryDetailPresenter;
