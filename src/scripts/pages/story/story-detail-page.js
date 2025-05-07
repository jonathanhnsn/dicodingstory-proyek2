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

  showStoryDetail(story) {
    const storyContainer = document.getElementById("story");

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        storyContainer.innerHTML = createStoryDetailTemplate(story);
      });

      transition.finished.then(() => {
        if (story.lat && story.lon) {
          this.initMap(story);
        }
      });
    } else {
      storyContainer.innerHTML = createStoryDetailTemplate(story);

      if (story.lat && story.lon) {
        this.initMap(story);
      }
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

export default StoryDetailPage;
