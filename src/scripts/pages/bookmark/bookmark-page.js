import BookmarkPresenter from "./bookmark-presenter";
import {
  createStoryItemTemplate,
  createLoadingTemplate,
  createErrorTemplate,
} from "../../utils";

class BookmarkPage {
  #presenter = null;

  async render() {
    return `
      <section class="container bookmark-page">
        <div class="skip-link">
          <a href="#main-content" class="skip-link__button">Langsung ke konten</a>
        </div>
        <h1 class="page-title">Cerita Tersimpan</h1>
        <div id="bookmarks" class="bookmarks-container">
          ${createLoadingTemplate()}
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
    });
    this.#presenter.init();
  }

  showLoading() {
    const bookmarksContainer = document.getElementById("bookmarks");
    bookmarksContainer.innerHTML = createLoadingTemplate();
  }

  showError(message) {
    const bookmarksContainer = document.getElementById("bookmarks");
    bookmarksContainer.innerHTML = createErrorTemplate(message);
  }

  showEmptyBookmarks() {
    const bookmarksContainer = document.getElementById("bookmarks");
    bookmarksContainer.innerHTML = `
      <div class="empty-state">
        <p>Tidak ada cerita tersimpan</p>
        <a href="#/" class="btn btn-primary">Jelajahi Cerita</a>
      </div>
    `;
  }

  showBookmarks(bookmarks) {
    const bookmarksContainer = document.getElementById("bookmarks");
    if (bookmarks.length === 0) {
      this.showEmptyBookmarks();
      return;
    }

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        bookmarksContainer.innerHTML = `
          <div class="stories-grid">
            ${bookmarks.map((story) => createStoryItemTemplate(story)).join("")}
          </div>
        `;
      });
      transition.finished.then(() => {
        this._setupDeleteButtons();
      });
    } else {
      bookmarksContainer.innerHTML = `
        <div class="stories-grid">
          ${bookmarks.map((story) => createStoryItemTemplate(story)).join("")}
        </div>
      `;
      this._setupDeleteButtons();
    }
  }

  _setupDeleteButtons() {
    const storyItems = document.querySelectorAll(".story-item");
    storyItems.forEach((item) => {
      const storyId = item
        .querySelector(".story-item__link")
        .getAttribute("href")
        .split("/")
        .pop();
      if (window.feather) {
        window.feather.replace();
      }
    });
  }
}

export default BookmarkPage;
