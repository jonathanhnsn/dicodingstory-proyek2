import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import AddStoryPage from "../pages/story/add-story-page";
import StoryDetailPage from "../pages/story/story-detail-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";

const routes = {
  "/": new HomePage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add": new AddStoryPage(),
  "/story/:id": new StoryDetailPage(),
  "/bookmarks": new BookmarkPage(),
};

export default routes;
