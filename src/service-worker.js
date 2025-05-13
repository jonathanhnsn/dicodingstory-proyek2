import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, setDefaultHandler } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = "dicoding-story-cache-v1";
const IMAGES_CACHE_NAME = "dicoding-story-images-v1";

const imageUrlPatterns = [
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
  /story-photo/,
  /photoUrl/,
];

const isImageRequest = ({ url, request }) => {
  return imageUrlPatterns.some((pattern) => pattern.test(url.href));
};

registerRoute(
  isImageRequest,
  new CacheFirst({
    cacheName: IMAGES_CACHE_NAME,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url }) =>
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/v1/stories"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);


self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).catch(() => caches.match("/offline.html"))
        );
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
  const options = notificationData.options;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked");
  event.notification.close();

  const urlToOpen = event.notification.data?.url ?? "./";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
