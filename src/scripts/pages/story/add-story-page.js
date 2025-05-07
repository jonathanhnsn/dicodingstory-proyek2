import AddStoryPresenter from "./add-story-presenter";
import NotificationManager from "../../utils/notification-manager";
import { createLoadingTemplate } from "../../utils";

class AddStoryPage {
  #presenter = null;
  #notificationManager = null;

  async render() {
    return `
      <section class="container add-page">
        <div class="skip-link">
          <a href="#main-content" class="skip-link__button">Langsung ke konten</a>
        </div>
        
        <h1 class="page-title">Tambah Cerita Baru</h1>
        
        <div class="back-button">
          <a href="#/" class="btn btn-back">
            <i data-feather="arrow-left"></i> Kembali
          </a>
        </div>
        
        <div id="notification-container" class="notification-container">
        </div>
        
        <div class="add-story-container">
          <form id="add-story-form" class="add-story-form">
            <div class="form-group">
              <label for="description">Deskripsi</label>
              <textarea 
                id="description" 
                name="description" 
                class="form-control" 
                placeholder="Ceritakan kisahmu..." 
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Foto</label>
              <div class="photo-input-tabs">
                <button type="button" id="camera-tab" class="tab-button active">
                  <i data-feather="camera"></i> Kamera
                </button>
                <button type="button" id="upload-tab" class="tab-button">
                  <i data-feather="upload"></i> Upload
                </button>
              </div>
              
              <div id="camera-section" class="camera-container">
                <video id="camera-preview" class="camera-preview" autoplay></video>
                <canvas id="camera-canvas" class="camera-canvas" style="display: none;"></canvas>
                <div class="camera-controls">
                  <button id="camera-capture" type="button" class="btn btn-primary">
                    <i data-feather="camera"></i> Ambil Foto
                  </button>
                  <button id="camera-retake" type="button" class="btn btn-secondary" style="display: none;">
                    <i data-feather="refresh-cw"></i> Ambil Ulang
                  </button>
                </div>
              </div>
              
              <div id="upload-section" class="upload-container" style="display: none;">
                <div class="file-upload-area">
                  <input type="file" id="photo-upload" name="photo-upload" accept="image/*" class="file-input" />
                  <label for="photo-upload" class="file-upload-label">
                    <span>Pilih file gambar</span>
                    <span class="file-upload-icon"><i data-feather="file"></i></span>
                  </label>
                </div>
                <div id="preview-container" class="preview-container" style="display: none;">
                  <img id="image-preview" class="image-preview" />
                  <button type="button" id="remove-image" class="btn btn-danger remove-image">
                    <i data-feather="trash-2"></i> Hapus
                  </button>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Lokasi</label>
              <div id="map" class="location-map"></div>
              <p class="location-info">
                <i data-feather="map-pin"></i> Klik pada peta untuk menentukan lokasi
              </p>
              <div id="location-coordinates" class="location-coordinates">
                <p>Belum ada lokasi yang dipilih</p>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" id="submit-button" class="btn btn-primary">
                <i data-feather="send"></i> Kirim Cerita
              </button>
            </div>
          </form>
          
          <div id="loading-container" style="display: none;">
            ${createLoadingTemplate()}
          </div>
          
          <div id="error-container" class="error-container" style="display: none;">
            <p id="error-message"></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
    });

    this.#notificationManager = new NotificationManager({
      container: document.getElementById("notification-container"),
    });
    await this.#notificationManager.init();

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        this.#presenter.init();
      });
      await transition.finished;
    } else {
      this.#presenter.init();
    }
  }

  redirectToLogin() {
    window.location.hash = "#/login";
  }

  redirectToHome() {
    window.location.hash = "#/";
  }

  initializeCamera(setStreamCallback, setCaptureDeviceCallback) {
    const cameraPreview = document.getElementById("camera-preview");
    const captureButton = document.getElementById("camera-capture");
    const retakeButton = document.getElementById("camera-retake");
    const canvas = document.getElementById("camera-canvas");

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
        },
      })
      .then((stream) => {
        cameraPreview.srcObject = stream;
        setStreamCallback(stream);

        const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
        setCaptureDeviceCallback(imageCapture);

        captureButton.addEventListener("click", () => {
          this.#presenter.capturePhoto(canvas, cameraPreview);
          cameraPreview.style.display = "none";
          canvas.style.display = "block";
          captureButton.style.display = "none";
          retakeButton.style.display = "block";
        });

        retakeButton.addEventListener("click", () => {
          setStreamCallback(stream);
          cameraPreview.style.display = "block";
          canvas.style.display = "none";
          captureButton.style.display = "block";
          retakeButton.style.display = "none";
        });
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
        const cameraContainer = document.querySelector(".camera-container");
        cameraContainer.innerHTML = `
        <div class="error">
          <p>Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.</p>
        </div>
      `;
      });
  }

  initializeUpload(setPhotoCallback) {
    const fileInput = document.getElementById("photo-upload");
    const previewContainer = document.getElementById("preview-container");
    const imagePreview = document.getElementById("image-preview");
    const removeButton = document.getElementById("remove-image");

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          previewContainer.style.display = "block";

          fetch(e.target.result)
            .then((res) => res.blob())
            .then((blob) => {
              setPhotoCallback(blob);
            });
        };

        reader.readAsDataURL(file);
      }
    });

    removeButton.addEventListener("click", () => {
      fileInput.value = "";
      imagePreview.src = "";
      previewContainer.style.display = "none";
      setPhotoCallback(null);
    });
  }

  initializeTabSwitching(pauseCameraCallback, resumeCameraCallback) {
    const cameraTab = document.getElementById("camera-tab");
    const uploadTab = document.getElementById("upload-tab");
    const cameraSection = document.getElementById("camera-section");
    const uploadSection = document.getElementById("upload-section");

    cameraTab.addEventListener("click", () => {
      cameraTab.classList.add("active");
      uploadTab.classList.remove("active");
      cameraSection.style.display = "block";
      uploadSection.style.display = "none";
      resumeCameraCallback();
    });

    uploadTab.addEventListener("click", () => {
      uploadTab.classList.add("active");
      cameraTab.classList.remove("active");
      uploadSection.style.display = "block";
      cameraSection.style.display = "none";
      pauseCameraCallback();
    });
  }

  initializeLocationMap(setLocationCallback) {
    const { initMap } = require("../../utils");
    const defaultPosition = { lat: -6.2088, lng: 106.8456 };

    const { map, marker } = initMap({
      containerId: "map",
      lat: defaultPosition.lat,
      lng: defaultPosition.lng,
      onClick: (lat, lng) => {
        setLocationCallback(lat, lng);
      },
    });
  }

  updateLocationDisplay(latitude, longitude) {
    const locationCoordinates = document.getElementById("location-coordinates");

    if (latitude && longitude) {
      locationCoordinates.innerHTML = `
        <p>Latitude: ${latitude.toFixed(6)}</p>
        <p>Longitude: ${longitude.toFixed(6)}</p>
      `;
    } else {
      locationCoordinates.innerHTML = `
        <p>Belum ada lokasi yang dipilih</p>
      `;
    }
  }

  showLoading() {
    const form = document.getElementById("add-story-form");
    const loadingContainer = document.getElementById("loading-container");
    form.style.display = "none";
    loadingContainer.style.display = "block";
  }

  hideLoading() {
    const form = document.getElementById("add-story-form");
    const loadingContainer = document.getElementById("loading-container");
    form.style.display = "block";
    loadingContainer.style.display = "none";
  }

  showError(message) {
    const errorContainer = document.getElementById("error-container");
    const errorMessage = document.getElementById("error-message");
    errorContainer.style.display = "block";
    errorMessage.textContent = message;
  }

  hideError() {
    const errorContainer = document.getElementById("error-container");
    errorContainer.style.display = "none";
  }

  initFormSubmission(submitCallback) {
    const form = document.getElementById("add-story-form");
    const descriptionInput = document.getElementById("description");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.hideError();
      submitCallback(descriptionInput.value);
    });
  }
}

export default AddStoryPage;
