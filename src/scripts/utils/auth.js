import {
  getItemFromLocalStorage,
  setItemToLocalStorage,
  removeItemFromLocalStorage,
} from "./index";

const AUTH_KEY = "auth";

const Auth = {
  setAuth({ token, name, userId }) {
    setItemToLocalStorage(
      AUTH_KEY,
      JSON.stringify({
        token,
        name,
        userId,
      })
    );
  },

  getToken() {
    const auth = this.getAuth();
    return auth ? auth.token : null;
  },

  getName() {
    const auth = this.getAuth();
    return auth ? auth.name : null;
  },

  getUserId() {
    const auth = this.getAuth();
    return auth ? auth.userId : null;
  },

  getAuth() {
    const auth = getItemFromLocalStorage(AUTH_KEY);
    return auth ? JSON.parse(auth) : null;
  },

  destroyAuth() {
    removeItemFromLocalStorage(AUTH_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export default Auth;
