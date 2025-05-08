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
        <i data-feather="bookmark" class="empty-state__icon"></i>
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

      // Add delete button to each story item
      const deleteButton = document.createElement("button");
      deleteButton.className = "btn btn-delete";
      deleteButton.innerHTML = '<i data-feather="trash-2"></i>';
      deleteButton.setAttribute("data-id", storyId);
      item.appendChild(deleteButton);

      // Initialize feather icons
      if (window.feather) {
        window.feather.replace();
      }

      // Add event listener to delete button
      deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.#presenter.removeBookmark(storyId);
      });
    });
  }
}

export default BookmarkPage;
