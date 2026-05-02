import api from "@/lib/api";

export const usersService = {
  // ─── Profile ──────────────────────────────────────────────────────────────

  async updateProfile(formData: FormData) {
    const res = await api.patch("/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async getProfile(username: string) {
    const res = await api.get(`/users/${username}`);
    return res.data;
  },

  // ─── Search ───────────────────────────────────────────────────────────────

  async searchUsers(query: string, page = 1) {
    const res = await api.get("/users/search", {
      params: { q: query, page, limit: 20 },
    });
    return res.data;
  },

  // ─── Follow / Unfollow ────────────────────────────────────────────────────

  async follow(username: string) {
    const res = await api.post(`/follow/${username}`);
    return res.data;
  },

  async unfollow(username: string) {
    const res = await api.delete(`/follow/${username}`);
    return res.data;
  },

  // ─── Followers & Following ────────────────────────────────────────────────

  async getFollowers(username: string, page = 1) {
    const res = await api.get(`/users/${username}/followers`, {
      params: { page, limit: 20 },
    });
    return res.data;
  },

  async getFollowing(username: string, page = 1) {
    const res = await api.get(`/users/${username}/following`, {
      params: { page, limit: 20 },
    });
    return res.data;
  },

  async getMyFollowers(page = 1) {
    const res = await api.get("/me/followers", { params: { page, limit: 20 } });
    return res.data;
  },

  async getMyFollowing(page = 1) {
    const res = await api.get("/me/following", { params: { page, limit: 20 } });
    return res.data;
  },
};
