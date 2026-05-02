import { authService } from "@/services";
import type { RegisterPayload } from "@/types";

/** Register page API surface. */
export const registerApi = {
  register: (payload: RegisterPayload) => authService.register(payload),
};
