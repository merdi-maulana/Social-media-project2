import { postsService } from "@/services/postsService";

/**
 * Feed page API surface.
 * Delegates to the global postsService.
 */
export const feedApi = {
  getPosts: (page: number, limit: number) => postsService.getPosts(page, limit),
  getFeed: (page: number, limit: number) => postsService.getFeed(page, limit),
};
