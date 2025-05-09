import StoryDetailPresenter from "./story-detail-presenter";
import { parseActivePathname } from "../../routes/url-parser";
import {
  createStoryDetailTemplate,
  createLoadingTemplate,
  createErrorTemplate,
  initMap,
} from "../../utils";

class StoryDetailPage {
  #presenter = null;

  async render() {
    return `
      <section class="container detail-page">
        <div class="skip-link">
          <a href="#main-content" class="skip-link__button">Langsung ke konten</a>
        </div>
        
        <div class="back-button">
          <a href="#/" class="btn btn-back">
            <i data-feather="arrow-left"></i> Kembali
          </a>
        </div>
        
        <div id="story" class="story-container">
          ${createLoadingTemplate()}
        </div>
        
        <div id="notification" class="notification"></div>
      </section>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();

    this.#presenter = new StoryDetailPresenter({
      view: this,
      storyId: id,
    });

    this.#presenter.init();
  }

  showUnauthenticatedState() {
    const storyContainer = document.getElementById("story");
    storyContainer.innerHTML = `
      <div class="error">
        <p>Silakan login untuk melihat detail cerita</p>
        <a href="#/login" class="btn btn-primary">Login</a>
      </div>
    `;
  }

  showLoading() {
    const storyContainer = document.getElementById("story");
    storyContainer.innerHTML = createLoadingTemplate();
  }

  showError(message) {
    const storyContainer = document.getElementById("story");
    storyContainer.innerHTML = createErrorTemplate(message);
  }

  showBookmarkNotification(isBookmarked) {
    const notification = document.getElementById("notification");
    notification.textContent = isBookmarked
      ? "Cerita berhasil disimpan"
      : "Cerita dihapus dari daftar simpanan";
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  updateBookmarkButton(isBookmarked) {
    const bookmarkButton = document.getElementById("bookmarkButton");
    if (bookmarkButton) {
      bookmarkButton.textContent = isBookmarked
        ? "Batal Simpan"
        : "Simpan Cerita";

      if (isBookmarked) {
        bookmarkButton.classList.add("bookmarked");
      } else {
        bookmarkButton.classList.remove("bookmarked");
      }
    }
  }

  showStoryDetail(story, isBookmarked) {
    const storyContainer = document.getElementById("story");

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        storyContainer.innerHTML = this._createStoryDetailWithBookmarkState(
          story,
          isBookmarked
        );
      });

      transition.finished.then(() => {
        this._setupBookmarkButton();
        if (story.lat && story.lon) {
          this.initMap(story);
        }
      });
    } else {
      storyContainer.innerHTML = this._createStoryDetailWithBookmarkState(
        story,
        isBookmarked
      );
      this._setupBookmarkButton();

      if (story.lat && story.lon) {
        this.initMap(story);
      }
    }
  }

  _createStoryDetailWithBookmarkState(story, isBookmarked) {
    return `
      <article class="story-detail">
        <h2 class="story-detail__title">${story.name}</h2>
        <img 
          src="${story.photoUrl}" 
          alt="Foto untuk cerita ${story.description}" 
          class="story-detail__image"
        >
        <div class="story-detail__content">
          <p class="story-detail__date">${showFormattedDate(
            story.createdAt
          )}</p>
          <p class="story-detail__description">${story.description}</p>
        </div>
        <div id="map" class="story-detail__map"></div>
        <button id="bookmarkButton" class="btn btn-primary ${
          isBookmarked ? "bookmarked" : ""
        }">
          ${isBookmarked ? "Batal Simpan" : "Simpan Cerita"}
        </button>
      </article>
    `;
  }

  _setupBookmarkButton() {
    const bookmarkButton = document.getElementById("bookmarkButton");
    if (bookmarkButton) {
      bookmarkButton.addEventListener("click", () => {
        this.#presenter.toggleBookmark();
      });
    }
  }

  initMap(story) {
    const { lat, lon: lng } = story;
    const { map, marker } = initMap({
      containerId: "map",
      lat,
      lng,
    });

    marker
      .bindPopup(
        `
        <div class="map-popup">
          <h3>${story.name}</h3>
          <p>${story.description.slice(0, 50)}${
          story.description.length > 50 ? "..." : ""
        }</p>
        </div>
      `
      )
      .openPopup();
  }
}

function showFormattedDate(date, locale = "id-ID", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export default StoryDetailPage;
