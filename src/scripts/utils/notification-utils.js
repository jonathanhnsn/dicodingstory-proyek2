import CONFIG from "../config";

const ENDPOINTS = {
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

const NotificationHelper = {
  async checkNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.log("User has denied notification permission");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  },

  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.log("Service Worker not supported in this browser");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      console.log("Service Worker registered with scope:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  },

  async subscribeToPushNotification(token) {
    if (!token) {
      console.error("Authentication token is required");
      return { error: true, message: "Authentication token is required" };
    }

    try {
      const swRegistration = await this.registerServiceWorker();
      if (!swRegistration) {
        return { error: true, message: "Service Worker registration failed" };
      }

      const hasPermission = await this.checkNotificationPermission();
      if (!hasPermission) {
        return { error: true, message: "Notification permission not granted" };
      }

      // Check if already subscribed
      const existingSubscription =
        await swRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed to push notifications");
        return {
          error: false,
          subscription: existingSubscription,
          message: "Already subscribed to push notifications",
        };
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = this._urlB64ToUint8Array(VAPID_PUBLIC_KEY);

      // Subscribe to push service
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log("Subscribed to push service:", subscription);

      // Send subscription to server
      const response = await this._sendSubscriptionToServer(
        subscription,
        token
      );
      return response;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return { error: true, message: error.message };
    }
  },

  async unsubscribeFromPushNotification(token) {
    if (!token) {
      console.error("Authentication token is required");
      return { error: true, message: "Authentication token is required" };
    }

    try {
      const swRegistration = await this.registerServiceWorker();
      if (!swRegistration) {
        return { error: true, message: "Service Worker registration failed" };
      }

      const subscription = await swRegistration.pushManager.getSubscription();
      if (!subscription) {
        return {
          error: false,
          message: "No subscription found to unsubscribe",
        };
      }

      // Get the endpoint before unsubscribing
      const endpoint = subscription.endpoint;

      // Unsubscribe locally
      const result = await subscription.unsubscribe();
      if (!result) {
        return { error: true, message: "Failed to unsubscribe locally" };
      }

      // Send unsubscribe request to server
      const response = await this._sendUnsubscribeToServer(endpoint, token);
      return response;
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      return { error: true, message: error.message };
    }
  },

  async isSubscribed() {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  },

  async _sendSubscriptionToServer(subscription, token) {
    const subscriptionJson = subscription.toJSON();

    try {
      const response = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth,
          },
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending subscription to server:", error);
      return { error: true, message: error.message };
    }
  },

  async _sendUnsubscribeToServer(endpoint, token) {
    try {
      const response = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending unsubscribe to server:", error);
      return { error: true, message: error.message };
    }
  },

  // Function to convert base64 to Uint8Array for the VAPID key
  _urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  // Show a sample notification (for testing purposes)
  async showSampleNotification() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    const title = "Dicoding Story";
    const options = {
      body: "Ini adalah contoh notifikasi dari Dicoding Story",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  },
};

export default NotificationHelper;
