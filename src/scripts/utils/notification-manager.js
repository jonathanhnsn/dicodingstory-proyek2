import NotificationHelper from "./notification-utils";
import Auth from "./auth";

class NotificationManager {
  #container = null;

  constructor({ container }) {
    this.#container = container;
    this.auth = Auth;
  }

  async init() {
    if (!("Notification" in window)) {
      this._renderUnsupported();
      return;
    }

    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      this._renderUnsupported();
      return;
    }

    // Check notification permission status
    const permissionStatus = Notification.permission;
    const isSubscribed = await NotificationHelper.isSubscribed();

    this._renderNotificationUI(permissionStatus, isSubscribed);
    this._initEventListeners();
  }

  async _initEventListeners() {
    const subscribeButton = document.getElementById("subscribe-button");
    const unsubscribeButton = document.getElementById("unsubscribe-button");

    if (subscribeButton) {
      subscribeButton.addEventListener("click", async () => {
        if (!this.auth.isAuthenticated()) {
          this._showMessage(
            "Silakan login terlebih dahulu untuk berlangganan notifikasi"
          );
          return;
        }

        try {
          this._showLoading();
          const token = this.auth.getToken();
          const result = await NotificationHelper.subscribeToPushNotification(
            token
          );

          if (result.error) {
            throw new Error(result.message);
          }

          this._showMessage("Berhasil berlangganan notifikasi");
          this._renderNotificationUI(Notification.permission, true);
        } catch (error) {
          this._showMessage(`Gagal berlangganan notifikasi: ${error.message}`);
        } finally {
          this._hideLoading();
        }
      });
    }

    if (unsubscribeButton) {
      unsubscribeButton.addEventListener("click", async () => {
        if (!this.auth.isAuthenticated()) {
          this._showMessage(
            "Silakan login terlebih dahulu untuk berhenti berlangganan"
          );
          return;
        }

        try {
          this._showLoading();
          const token = this.auth.getToken();
          const result =
            await NotificationHelper.unsubscribeFromPushNotification(token);

          if (result.error) {
            throw new Error(result.message);
          }

          this._showMessage("Berhasil berhenti berlangganan notifikasi");
          this._renderNotificationUI(Notification.permission, false);
        } catch (error) {
          this._showMessage(`Gagal berhenti berlangganan: ${error.message}`);
        } finally {
          this._hideLoading();
        }
      });
    }
  }

  _renderNotificationUI(permissionStatus, isSubscribed) {
    let content = "";

    if (permissionStatus === "denied") {
      content = `
        <div class="notification-manager">
          <div class="notification-status notification-denied">
            <i data-feather="bell-off"></i>
            <p>Notifikasi diblokir. Silakan ubah pengaturan browser Anda untuk mengizinkan notifikasi dari situs ini.</p>
          </div>
        </div>
      `;
    } else if (isSubscribed) {
      content = `
        <div class="notification-manager">
          <div class="notification-status notification-subscribed">
            <i data-feather="bell"></i>
            <p>Anda sudah berlangganan notifikasi</p>
          </div>
          <button id="unsubscribe-button" class="btn btn-outline">
            <i data-feather="bell-off"></i> Berhenti Berlangganan
          </button>
        </div>
      `;
    } else {
      content = `
        <div class="notification-manager">
          <div class="notification-status">
            <i data-feather="bell"></i>
            <p>Dapatkan notifikasi untuk cerita baru</p>
          </div>
          <button id="subscribe-button" class="btn btn-primary">
            <i data-feather="bell"></i> Langganan Notifikasi
          </button>
        </div>
      `;
    }

    this.#container.innerHTML = content;

    // Initialize icons if feather is available
    if (window.feather) {
      window.feather.replace();
    }
  }

  _renderUnsupported() {
    this.#container.innerHTML = `
      <div class="notification-manager">
        <div class="notification-status notification-unsupported">
          <i data-feather="alert-circle"></i>
          <p>Browser Anda tidak mendukung notifikasi atau service worker</p>
        </div>
      </div>
    `;

    if (window.feather) {
      window.feather.replace();
    }
  }

  _showMessage(message) {
    const messageContainer = document.createElement("div");
    messageContainer.className = "notification-message";
    messageContainer.innerHTML = `
      <p>${message}</p>
      <button class="close-button">
        <i data-feather="x"></i>
      </button>
    `;

    this.#container.appendChild(messageContainer);

    // Initialize icons if feather is available
    if (window.feather) {
      window.feather.replace();
    }

    const closeButton = messageContainer.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
      messageContainer.remove();
    });

    // Auto hide after 5 seconds
    setTimeout(() => {
      if (messageContainer.parentNode) {
        messageContainer.remove();
      }
    }, 5000);
  }

  _showLoading() {
    const loadingEl = document.createElement("div");
    loadingEl.className = "notification-loading";
    loadingEl.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
      </div>
    `;

    this.#container.appendChild(loadingEl);
  }

  _hideLoading() {
    const loadingEl = this.#container.querySelector(".notification-loading");
    if (loadingEl) {
      loadingEl.remove();
    }
  }
}

export default NotificationManager;
