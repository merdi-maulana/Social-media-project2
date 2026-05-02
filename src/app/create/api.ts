import { postsService } from "@/services/postsService";

/** Create page API surface. */
export const createApi = {
  createPost: (formData: FormData) => postsService.createPost(formData),
};
