const CACHE_NAME = "dicoding-story-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/favicon.png",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching Files");
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
            if (cache !== CACHE_NAME) {
              console.log("Service Worker: Clearing Old Cache");
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // If not in cache, fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response as it can only be consumed once
          const responseToCache = response.clone();

          // Open cache and store the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, you can provide a fallback
        if (event.request.url.indexOf(".html") > -1) {
          return caches.match("/offline.html");
        }
      })
  );
});

// Push event - handle incoming push messages
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
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
        vibrate: [100, 50, 100, 50, 100],
        data: {
          url: "/",
        },
      },
    };
  }

  const title = notificationData.title || "Dicoding Story";
  const options = notificationData.options || {
    body: "Ada cerita baru untuk Anda",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100, 50, 100],
    data: {
      url: "/",
    },
  };

  const showNotificationPromise = self.registration.showNotification(
    title,
    options
  );

  event.waitUntil(showNotificationPromise);
});

// Notification click event - handle user interaction with notification
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked");

  event.notification.close();

  // Open the site when the user clicks on the notification
  const urlToOpen =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If so, focus on it
          if (client.url.indexOf(urlToOpen) >= 0 && "focus" in client) {
            return client.focus();
          }
        }

        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
