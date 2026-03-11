import api from "@/lib/api";

/** Accepts both numeric and string post IDs (API returns numbers, paths need strings). */
type PostId = number | string;

export const postsService = {
  // ─── Feed & Explore ──────────────────────────────────────────────────────

  async getFeed(page = 1, limit = 20) {
    const res = await api.get("/feed", { params: { page, limit } });
    return res.data;
  },

  async getPosts(page = 1, limit = 20) {
    const res = await api.get("/posts", { params: { page, limit } });
    return res.data;
  },

  // ─── Single Post ──────────────────────────────────────────────────────────

  async getPost(id: PostId) {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },

  async createPost(formData: FormData) {
    const res = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async deletePost(id: PostId) {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },

  // ─── Likes ────────────────────────────────────────────────────────────────

  async likePost(id: PostId) {
    const res = await api.post(`/posts/${id}/like`);
    return res.data;
  },

  async unlikePost(id: PostId) {
    const res = await api.delete(`/posts/${id}/like`);
    return res.data;
  },

  async getLikes(id: PostId, page = 1, limit = 20) {
    const res = await api.get(`/posts/${id}/likes`, {
      params: { page, limit },
    });
    return res.data;
  },

  // ─── Saves ────────────────────────────────────────────────────────────────

  async savePost(id: PostId) {
    const res = await api.post(`/posts/${id}/save`);
    return res.data;
  },

  async unsavePost(id: PostId) {
    const res = await api.delete(`/posts/${id}/save`);
    return res.data;
  },

  // ─── Comments ─────────────────────────────────────────────────────────────

  async getComments(postId: PostId, page = 1, limit = 10) {
    const res = await api.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return res.data;
  },

  async addComment(postId: PostId, text: string) {
    const res = await api.post(`/posts/${postId}/comments`, { text });
    return res.data;
  },

  async deleteComment(commentId: PostId) {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },

  // ─── My Profile ───────────────────────────────────────────────────────────

  async getMyPosts(page = 1, limit = 20) {
    const res = await api.get("/me/posts", { params: { page, limit } });
    return res.data;
  },

  async getMyLikes(page = 1, limit = 20) {
    const res = await api.get("/me/likes", { params: { page, limit } });
    return res.data;
  },

  async getMySaved(page = 1, limit = 20) {
    const res = await api.get("/me/saved", { params: { page, limit } });
    return res.data;
  },

  // ─── User Posts ───────────────────────────────────────────────────────────

  async getUserPosts(username: string, page = 1, limit = 20) {
    const res = await api.get(`/users/${username}/posts`, {
      params: { page, limit },
    });
    return res.data;
  },

  async getUserLikes(username: string, page = 1, limit = 20) {
    const res = await api.get(`/users/${username}/likes`, {
      params: { page, limit },
    });
    return res.data;
  },
};
