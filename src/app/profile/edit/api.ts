import { authService } from "@/services";

/** Edit profile page API surface. */
export const editProfileApi = {
  updateMe: (data: FormData | Record<string, unknown>) => authService.updateMe(data),
};
