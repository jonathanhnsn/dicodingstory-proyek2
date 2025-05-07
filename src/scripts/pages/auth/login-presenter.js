import ApiService from "../../../scripts/data/api";
import Auth from "../../utils/auth";

class LoginPresenter {
  #view = null;
  #api = null;
  #auth = null;

  constructor({ view, api = ApiService, auth = Auth }) {
    this.#view = view;
    this.#api = api;
    this.#auth = auth;

    this._initialState = {
      loading: false,
      error: null,
    };

    this._state = { ...this._initialState };
  }

  init() {
    this._resetState();

    if (this.#auth.isAuthenticated()) {
      this.#view.redirectToHome();
      return;
    }
  }

  _resetState() {
    this._state = { ...this._initialState };
  }

  async login(email, password) {
    this._state.loading = true;
    this.#view.showLoading();

    try {
      const response = await this.#api.login({
        email: email.trim(),
        password: password,
      });

      if (response.error) {
        throw new Error(response.message);
      }

      this.#auth.setAuth({
        token: response.loginResult.token,
        name: response.loginResult.name,
        userId: response.loginResult.userId,
      });

      this.#view.redirectToHome();
    } catch (error) {
      this._state.error = error.message;
      this.#view.showError(error.message);
    } finally {
      this._state.loading = false;
      this.#view.hideLoading();
    }
  }

  isAuthenticated() {
    return this.#auth.isAuthenticated();
  }
}

export default LoginPresenter;
