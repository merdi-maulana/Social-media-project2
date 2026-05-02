import { postsService } from "@/services/postsService";

/** Post detail page API surface. */
export const postDetailApi = {
  getPost: (id: string) => postsService.getPost(id),
  getComments: (postId: string, page = 1, limit = 10) =>
    postsService.getComments(postId, page, limit),
  addComment: (postId: string, text: string) =>
    postsService.addComment(postId, text),
  deleteComment: (commentId: string) => postsService.deleteComment(commentId),
  likePost: (id: string) => postsService.likePost(id),
  unlikePost: (id: string) => postsService.unlikePost(id),
  savePost: (id: string) => postsService.savePost(id),
  unsavePost: (id: string) => postsService.unsavePost(id),
  deletePost: (id: string) => postsService.deletePost(id),
};
