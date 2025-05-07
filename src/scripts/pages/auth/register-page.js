import RegisterPresenter from "./register-presenter";
import { createLoadingTemplate } from "../../utils";

class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="container auth-container">
        <div class="skip-link">
          <a href="#main-content" class="skip-link__button">Langsung ke konten</a>
        </div>
        
        <h1 class="page-title">Register</h1>
        
        <div class="auth-form-container">
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-control" 
                placeholder="Masukkan nama" 
                required
              >
            </div>
          
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-control" 
                placeholder="Masukkan email" 
                required
              >
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-control" 
                placeholder="Masukkan password" 
                minlength="6"
                required
              >
              <small>Password minimal 6 karakter</small>
            </div>
            
            <div class="form-actions">
              <button type="submit" id="submit-button" class="btn btn-primary">Register</button>
            </div>
          </form>
          
          <div id="loading-container" style="display: none;">
            ${createLoadingTemplate()}
          </div>
          
          <div id="error-container" class="error-container" style="display: none;">
            <p id="error-message"></p>
          </div>
          
          <div id="success-container" class="success-container" style="display: none;">
            <p id="success-message"></p>
          </div>
          
          <div class="auth-links">
            <p>Sudah punya akun? <a href="#/login">Login</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
    });

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        this.#presenter.init();
      });
      await transition.finished;
    } else {
      this.#presenter.init();
    }

    this._initFormSubmission();
  }

  redirectToHome() {
    window.location.hash = "#/";
  }

  redirectToLogin() {
    window.location.hash = "#/login";
  }

  showLoading() {
    const form = document.getElementById("register-form");
    const loadingContainer = document.getElementById("loading-container");
    form.style.display = "none";
    loadingContainer.style.display = "block";
  }

  hideLoading() {
    const form = document.getElementById("register-form");
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

  showSuccess(message) {
    const successContainer = document.getElementById("success-container");
    const successMessage = document.getElementById("success-message");
    successContainer.style.display = "block";
    successMessage.textContent = message;
  }

  hideSuccess() {
    const successContainer = document.getElementById("success-container");
    successContainer.style.display = "none";
  }

  _initFormSubmission() {
    const form = document.getElementById("register-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.hideError();
      this.hideSuccess();
      this.#presenter.register(
        nameInput.value,
        emailInput.value,
        passwordInput.value
      );
    });
  }
}

export default RegisterPage;
