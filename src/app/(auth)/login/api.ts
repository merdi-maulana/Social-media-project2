import { authService } from "@/services";
import type { LoginPayload } from "@/types";

/** Login page API surface. */
export const loginApi = {
  login: (payload: LoginPayload) => authService.login(payload),
};
