export function showFormattedDate(date, locale = "id-ID", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function createUrlWithParams(url, params) {
  const urlObj = new URL(url);
  Object.keys(params).forEach((key) => {
    urlObj.searchParams.append(key, params[key]);
  });
  return urlObj;
}

export function getItemFromLocalStorage(key) {
  return localStorage.getItem(key);
}

export function setItemToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

export function removeItemFromLocalStorage(key) {
  localStorage.removeItem(key);
}

export function createStoryItemTemplate(story) {
  return `
    <article class="story-item">
      <a href="#/story/${story.id}" class="story-item__link">
        <img 
          src="${story.photoUrl}" 
          alt="Foto untuk cerita ${story.description}" 
          class="story-item__thumbnail lazyload"
          loading="lazy"
        >
        <div class="story-item__content">
          <h3 class="story-item__title">${story.name}</h3>
          <p class="story-item__description">${story.description.slice(
            0,
            100
          )}${story.description.length > 100 ? "..." : ""}</p>
          <p class="story-item__date">${showFormattedDate(story.createdAt)}</p>
        </div>
      </a>
    </article>
  `;
}

export function createStoryDetailTemplate(story) {
  return `
    <article class="story-detail">
      <h2 class="story-detail__title">${story.name}</h2>
      <img 
        src="${story.photoUrl}" 
        alt="Foto untuk cerita ${story.description}" 
        class="story-detail__image"
      >
      <div class="story-detail__content">
        <p class="story-detail__date">${showFormattedDate(story.createdAt)}</p>
        <p class="story-detail__description">${story.description}</p>
      </div>
      <div id="map" class="story-detail__map"></div>
    </article>
  `;
}

export function createLoadingTemplate() {
  return `
    <div class="loading">
      <div class="loading__spinner"></div>
      <p>Memuat...</p>
    </div>
  `;
}

export function createErrorTemplate(message) {
  return `
    <div class="error">
      <p>${message}</p>
    </div>
  `;
}

export function initMap({ containerId, lat, lng, onClick = null }) {
  const map = L.map(containerId).setView([lat, lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const marker = L.marker([lat, lng]).addTo(map);

  if (onClick) {
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onClick(lat, lng);
    });
  }

  return { map, marker };
}
