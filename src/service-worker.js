const CACHE_NAME = "dicoding-story-cache-v1";
const IMAGES_CACHE_NAME = "dicoding-story-images-v1";

// Static assets to cache on install
const urlsToCache = [
  "index.html",
  "app.css",
  "app.js",
  "favicon.png",
  "manifest.json",
  "offline.html",
  "images/logo.png",
];

// Image URL patterns to cache
const imageUrlPatterns = [
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
  /story-photo/,
  /photoUrl/,
];

// Check if a URL matches any of our image patterns
function isImageUrl(url) {
  return imageUrlPatterns.some((pattern) => pattern.test(url));
}

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching basic files");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME && cache !== IMAGES_CACHE_NAME) {
              console.log("Service Worker: Clearing old cache", cache);
              return caches.delete(cache);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Handle image requests separately
  if (isImageUrl(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response before caching
            const responseToCache = response.clone();

            caches.open(IMAGES_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              console.log("Service Worker: Caching image", event.request.url);
            });

            return response;
          })
          .catch(() => {
            // If no image is found in cache, fallback to a placeholder or default image
            // You can replace this with your own fallback image
            return new Response("Image not available offline", {
              status: 503,
              statusText: "Offline - Image not available",
            });
          });
      })
    );
  } else {
    // Handle regular requests
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (
              !response ||
              response.status !== 200 ||
              (requestUrl.origin !== location.origin &&
                !isImageUrl(event.request.url))
            ) {
              return response;
            }

            let responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            if (event.request.headers.get("accept").includes("text/html")) {
              return caches.match("./offline.html");
            }

            return new Response("Content not available offline", {
              status: 503,
              statusText: "Offline",
            });
          });
      })
    );
  }
});

self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received");

  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: "Dicoding Story",
      options: {
        body: "Ada cerita baru untuk Anda",
        icon: "./images/logo.png",
        badge: "./images/logo.png",
        vibrate: [100, 50, 100, 50, 100],
        data: {
          url: "./",
        },
      },
    };
  }

  const title = notificationData.title || "Dicoding Story";
  const options = notificationData.options || {
    body: "Ada cerita baru untuk Anda",
    icon: "./images/logo.png",
    badge: "./images/logo.png",
    vibrate: [100, 50, 100, 50, 100],
    data: {
      url: "./",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked");
  event.notification.close();

  const urlToOpen =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "./";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.indexOf(urlToOpen) >= 0 && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }

        return null;
      })
  );
});
