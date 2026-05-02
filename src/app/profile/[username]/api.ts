import { usersService } from "@/services/usersService";
import { postsService } from "@/services/postsService";

/** Friend profile page API surface. */
export const friendProfileApi = {
  getProfile: (username: string) => usersService.getProfile(username),
  follow: (username: string) => usersService.follow(username),
  unfollow: (username: string) => usersService.unfollow(username),
  getUserPosts: (username: string, page = 1, limit = 20) =>
    postsService.getUserPosts(username, page, limit),
  getUserLikes: (username: string, page = 1, limit = 20) =>
    postsService.getUserLikes(username, page, limit),
};
