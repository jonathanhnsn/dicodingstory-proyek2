import ApiService from "../../../scripts/data/api";
import Auth from "../../utils/auth";
import { getAllStories } from "../../db-operations";

class HomePresenter {
  #view = null;
  #api = null;
  #auth = null;

  constructor({ view, api = ApiService, auth = Auth }) {
    this.#view = view;
    this.#api = api;
    this.#auth = auth;

    this._initialState = {
      stories: [],
      loading: false,
      error: null,
      page: 1,
      hasMore: true,
    };

    this._state = { ...this._initialState };
  }

  init() {
    this._resetState();

    if (!this.#auth.isAuthenticated()) {
      this.#view.showUnauthenticatedState();
      return;
    }

    this._fetchStories();
    this.#view.setupLoadMoreButton(this._onLoadMore.bind(this));
  }

  _resetState() {
    this._state = { ...this._initialState };
  }

  _onLoadMore() {
    this._state.page += 1;
    this._fetchStories(true);
  }

  async _fetchStories(isLoadMore = false) {
    this._state.loading = true;

    if (!isLoadMore) {
      this.#view.showLoading();
    }

    try {
      const token = this.#auth.getToken();
      const response = await this.#api.getAllStories(token, {
        page: this._state.page,
        size: 10,
        location: 1,
      });

      if (response.error) {
        throw new Error(response.message);
      }

      const listStory = response.listStory || [];

      if (listStory.length === 0) {
        throw new Error(
          response.message || "Tidak ada cerita yang bisa ditampilkan."
        );
      }

      this._state.hasMore = listStory.length === 10;

      if (isLoadMore) {
        this._state.stories = [...this._state.stories, ...listStory];
      } else {
        this._state.stories = listStory;
      }

      this.#view.showStories(this._state.stories);
      this.#view.setLoadMoreVisibility(this._state.hasMore);
    } catch (error) {
      this._state.error = error.message;
      console.error("Fetch API gagal:", error.message);

      await this.#showCachedStories();
    } finally {
      this._state.loading = false;
    }
  }

  async #showCachedStories() {
    const cachedStories = await getAllStories();

    if (!cachedStories.length) {
      this.#view.showError("Tidak ada data offline yang tersedia.");
      return;
    }

    this._state.stories = cachedStories;
    this.#view.showStories(cachedStories);
    this.#view.setLoadMoreVisibility(false);
  }

  isAuthenticated() {
    return this.#auth.isAuthenticated();
  }
}

export default HomePresenter;
