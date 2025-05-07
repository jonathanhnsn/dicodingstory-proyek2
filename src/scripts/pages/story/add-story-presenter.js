import ApiService from "../../../scripts/data/api";
import Auth from "../../utils/auth";

class AddStoryPresenter {
  #view = null;
  #api = null;
  #auth = null;

  constructor({ view, api = ApiService, auth = Auth }) {
    this.#view = view;
    this.#api = api;
    this.#auth = auth;

    this._initialState = {
      imageCapture: null,
      stream: null,
      photo: null,
      latitude: null,
      longitude: null,
      description: "",
      loading: false,
      error: null,
    };

    this._state = { ...this._initialState };
  }

  init() {
    this._resetState();

    if (!this.#auth.isAuthenticated()) {
      this.#view.redirectToLogin();
      return;
    }

    this.#view.initializeCamera(
      this._setCameraStream.bind(this),
      this._setCaptureDevice.bind(this)
    );
    this.#view.initializeUpload(this._setPhoto.bind(this));
    this.#view.initializeTabSwitching(
      this._pauseCameraStream.bind(this),
      this._resumeCameraStream.bind(this)
    );
    this.#view.initializeLocationMap(this._setLocation.bind(this));
    this.#view.initFormSubmission(this._submitStory.bind(this));
  }

  _resetState() {
    this._state = { ...this._initialState };
  }

  _setCameraStream(stream) {
    this._state.stream = stream;
  }

  _setCaptureDevice(imageCapture) {
    this._state.imageCapture = imageCapture;
  }

  _setPhoto(photo) {
    this._state.photo = photo;
  }

  _setLocation(latitude, longitude) {
    this._state.latitude = latitude;
    this._state.longitude = longitude;
    this.#view.updateLocationDisplay(latitude, longitude);
  }

  _pauseCameraStream() {
    if (this._state.stream) {
      this._state.stream.getTracks().forEach((track) => {
        track.enabled = false;
      });
    }
  }

  _resumeCameraStream() {
    if (this._state.stream) {
      this._state.stream.getTracks().forEach((track) => {
        track.enabled = true;
      });
    }
  }

  async _submitStory(description) {
    if (!description.trim()) {
      this.#view.showError("Deskripsi tidak boleh kosong");
      return;
    }

    if (!this._state.photo) {
      this.#view.showError("Foto belum diambil");
      return;
    }

    this._state.loading = true;
    this._state.description = description.trim();
    this.#view.showLoading();

    try {
      const token = this.#auth.getToken();
      const response = await this.#api.addStory({
        token,
        description: this._state.description,
        photo: this._state.photo,
        lat: this._state.latitude,
        lon: this._state.longitude,
      });

      if (response.error) {
        throw new Error(response.message);
      }

      this._stopCameraStream();
      this.#view.redirectToHome();
    } catch (error) {
      this._state.error = error.message;
      this.#view.showError(error.message);
    } finally {
      this._state.loading = false;
    }
  }

  _stopCameraStream() {
    if (this._state.stream) {
      this._state.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this._state.stream = null;
    }
  }

  capturePhoto(canvas, videoElement) {
    const context = canvas.getContext("2d");

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

    canvas.style.width = videoElement.style.width;
    canvas.style.height = videoElement.style.height;

    canvas.toBlob(
      (blob) => {
        this._state.photo = blob;
      },
      "image/jpeg",
      0.8
    );
  }

  isAuthenticated() {
    return this.#auth.isAuthenticated();
  }
}

export default AddStoryPresenter;
