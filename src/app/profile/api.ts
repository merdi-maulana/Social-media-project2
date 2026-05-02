import { authService } from "@/services";
import { postsService } from "@/services/postsService";

/** My profile page API surface. */
export const profileApi = {
  getMe: () => authService.getMe(),
  getMyPosts: (page = 1, limit = 20) => postsService.getMyPosts(page, limit),
  getMySaved: (page = 1, limit = 20) => postsService.getMySaved(page, limit),
};
