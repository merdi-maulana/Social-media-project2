/**
 * Barrel export for all API services.
 * Import from "@/services" instead of individual files.
 *
 * @example
 * import { authService, postsService, usersService } from "@/services";
 */
export { authService } from "./authServices";
export { postsService } from "../app/feed/api";
export { usersService } from "../app/profile/api";
