import HomePresenter from "./home-presenter";
import NotificationManager from "../../utils/notification-manager";
import {
  createStoryItemTemplate,
  createLoadingTemplate,
  createErrorTemplate,
} from "../../utils";

class HomePage {
  #presenter = null;
  #notificationManager = null;

  async render() {
    return `
      <section class="container home-page">
        <div class="skip-link">
          <a href="#main-content" class="skip-link__button">Langsung ke konten</a>
        </div>
        
        <h1 class="page-title">Dicoding Story</h1>
        
        <div id="auth-buttons-container">
        </div>
        
        <div id="notification-container" class="notification-container">
        </div>
        
        <div id="stories" class="stories">
          ${createLoadingTemplate()}
        </div>
        
        <div id="load-more" class="load-more" style="display: none;">
          <button id="load-more-button" class="btn btn-secondary">
            Muat Lebih Banyak <i data-feather="chevron-down"></i>
          </button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
    });

    // Initialize notification manager
    this.#notificationManager = new NotificationManager({
      container: document.getElementById("notification-container"),
    });
    await this.#notificationManager.init();

    this._renderAuthButtons();
    this.#presenter.init();
  }

  _renderAuthButtons() {
    const authButtonsContainer = document.getElementById(
      "auth-buttons-container"
    );

    if (this.#presenter.isAuthenticated()) {
      authButtonsContainer.innerHTML = `
      <div class="action-buttons">
        <a href="#/add" class="btn btn-primary">
          <i data-feather="plus"></i> Tambah Cerita
        </a>
      </div>
    `;
    } else {
      authButtonsContainer.innerHTML = `
      <div class="auth-buttons">
        <a href="#/login" class="btn btn-primary">
          <i data-feather="log-in"></i> Login
        </a>
        <a href="#/register" class="btn btn-secondary">
          <i data-feather="user-plus"></i> Register
        </a>
      </div>
    `;
    }

    if (window.feather) {
      window.feather.replace();
    }
  }

  showUnauthenticatedState() {
    const storiesContainer = document.getElementById("stories");
    storiesContainer.innerHTML = `
      <div class="empty-state">
        <p>Silakan login untuk melihat cerita</p>
      </div>
    `;
  }

  showLoading() {
    const storiesContainer = document.getElementById("stories");
    storiesContainer.innerHTML = createLoadingTemplate();
  }

  showError(message) {
    const storiesContainer = document.getElementById("stories");
    storiesContainer.innerHTML = createErrorTemplate(message);
  }

  showStories(stories) {
    const storiesContainer = document.getElementById("stories");

    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <p>Belum ada cerita yang ditambahkan</p>
        </div>
      `;
      return;
    }

    const storiesHtml = stories
      .map((story) => createStoryItemTemplate(story))
      .join("");

    storiesContainer.innerHTML = `
      <div class="stories-grid">
        ${storiesHtml}
      </div>
    `;
  }

  setLoadMoreVisibility(visible) {
    const loadMoreContainer = document.getElementById("load-more");
    loadMoreContainer.style.display = visible ? "block" : "none";
  }

  setupLoadMoreButton(callback) {
    const loadMoreButton = document.getElementById("load-more-button");
    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", callback);
    }
  }
}

export default HomePage;
