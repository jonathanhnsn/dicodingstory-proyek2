const CACHE_NAME = "dicoding-story-cache-v1";
const urlsToCache = ["/", "/index.html", "/favicon.png", "/offline.html"];

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
        if (response) return response;

        return fetch(event.request).then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/offline.html");
        }

        if (event.request.headers.get("accept")?.includes("application/json")) {
          return new Response(
            JSON.stringify({
              message: "Offline – tidak dapat mengambil data dari server.",
            }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response("", {
          status: 503,
          statusText: "Offline",
        });
      })
  );
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

self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked");

  event.notification.close();

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
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.indexOf(urlToOpen) >= 0 && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
