import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser, AuthState } from "@/types";

const getInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }
  try {
    const token = localStorage.getItem("sociality_token");
    const userStr = localStorage.getItem("sociality_user");
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      user,
      token,
      isAuthenticated: !!(token && user),
    };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("sociality_token", action.payload.token);
        localStorage.setItem(
          "sociality_user",
          JSON.stringify(action.payload.user),
        );
      }
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("sociality_user", JSON.stringify(state.user));
        }
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("sociality_token");
        localStorage.removeItem("sociality_user");
      }
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
