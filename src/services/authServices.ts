import api from "@/lib/api";
import { AuthResponse, LoginPayload, RegisterPayload } from "@/types";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post("/auth/login", payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  async getMe() {
    const res = await api.get("/me");
    return res.data;
  },

  async updateMe(data: FormData | Record<string, unknown>) {
    let formData: FormData;
    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }
    const res = await api.patch("/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
