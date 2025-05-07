import CONFIG from "../config";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  GET_STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

const ApiService = {
  async register({ name, email, password }) {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    return response.json();
  },

  async login({ email, password }) {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    return response.json();
  },

  async getAllStories(token, { page = 1, size = 10, location = 0 } = {}) {
    const url = new URL(ENDPOINTS.GET_STORIES);

    url.searchParams.append("page", page);
    url.searchParams.append("size", size);
    url.searchParams.append("location", location);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async getStoryDetail(token, id) {
    const response = await fetch(ENDPOINTS.GET_STORY_DETAIL(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async addStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();

    formData.append("description", description);
    formData.append("photo", photo);

    if (lat !== null && lon !== null) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.json();
  },

  async subscribeNotification(token, subscription) {
    const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      }),
    });

    return response.json();
  },

  async unsubscribeNotification(token, endpoint) {
    const response = await fetch(ENDPOINTS.UNSUBSCRIBE_NOTIFICATION, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint,
      }),
    });

    return response.json();
  },

  getVapidPublicKey() {
    return VAPID_PUBLIC_KEY;
  },
};

export default ApiService;
