import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import Auth from "../utils/auth";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #authNavItem = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#authNavItem = document.getElementById("auth-nav-item");

    this._setupDrawer();
    this._setupAuthNav();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupAuthNav() {
    this.#authNavItem.innerHTML = Auth.isAuthenticated()
      ? `<a href="#" id="logout-button">Logout</a>`
      : `<a href="#/login">Login</a>`;

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        Auth.destroyAuth();
        window.location.hash = "#/";
        this._setupAuthNav();
      });
    }
  }

  initIcons() {
    if (window.feather) {
      window.feather.replace();
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = `
      <section class="container">
        <div class="error-container">
          <h2>404 - Halaman tidak ditemukan</h2>
          <p>Halaman yang Anda cari tidak tersedia.</p>
          <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
        </div>
      </section>
    `;
      this.initIcons();
      return;
    }

    this._setupAuthNav();

    if (document.startViewTransition) {
      const transition = document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this.initIcons();
      });
      await transition.finished;
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.initIcons();
    }
  }
}

export default App;
