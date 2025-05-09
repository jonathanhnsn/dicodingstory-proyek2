import BookmarkDB from "../../data/indexeddb-utils";
import Auth from "../../utils/auth";

class BookmarkPresenter {
  #view = null;
  #auth = null;

  constructor({ view, auth = Auth }) {
    this.#view = view;
    this.#auth = auth;

    this._initialState = {
      bookmarks: [],
      loading: false,
      error: null,
    };

    this._state = { ...this._initialState };
  }

  init() {
    this._resetState();

    if (!this.#auth.isAuthenticated()) {
      window.location.hash = "#/login";
      return;
    }

    this._fetchBookmarks();
  }

  _resetState() {
    this._state = { ...this._initialState };
  }

  async _fetchBookmarks() {
    this._state.loading = true;
    this.#view.showLoading();

    try {
      const bookmarks = await BookmarkDB.getAll();
      this._state.bookmarks = bookmarks;
      this.#view.showBookmarks(this._state.bookmarks);
    } catch (error) {
      this._state.error = error.message;
      this.#view.showError("Gagal memuat cerita tersimpan");
      console.error("Error fetching bookmarks:", error);
    } finally {
      this._state.loading = false;
    }
  }

  async removeBookmark(storyId) {
    try {
      await BookmarkDB.delete(storyId);
      this._state.bookmarks = this._state.bookmarks.filter(
        (bookmark) => bookmark.id !== storyId
      );
      this.#view.showBookmarks(this._state.bookmarks);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      this.#view.showError("Gagal menghapus cerita tersimpan");
    }
  }
}

export default BookmarkPresenter;
