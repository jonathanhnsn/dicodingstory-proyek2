import LoginPresenter from "./login-presenter";
import { createLoadingTemplate } from "../../utils";

class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="container auth-container">
        <div class="skip-link">
          <a href="#main-content" class="skip-link__button">Langsung ke konten</a>
        </div>
        
        <h1 class="page-title">Login</h1>
        
        <div class="auth-form-container">
          <form id="login-form" class="auth-form">
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
                required
              >
            </div>
            
            <div class="form-actions">
              <button type="submit" id="submit-button" class="btn btn-primary">Login</button>
            </div>
          </form>
          
          <div id="loading-container" style="display: none;">
            ${createLoadingTemplate()}
          </div>
          
          <div id="error-container" class="error-container" style="display: none;">
            <p id="error-message"></p>
          </div>
          
          <div class="auth-links">
            <p>Belum punya akun? <a href="#/register">Register</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
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

  showLoading() {
    const form = document.getElementById("login-form");
    const loadingContainer = document.getElementById("loading-container");
    form.style.display = "none";
    loadingContainer.style.display = "block";
  }

  hideLoading() {
    const form = document.getElementById("login-form");
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

  _initFormSubmission() {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.hideError();
      this.#presenter.login(emailInput.value, passwordInput.value);
    });
  }
}

export default LoginPage;
