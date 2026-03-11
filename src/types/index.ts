// =====================
// Core User Types
// =====================
export interface Author {
  id: number;
  username: string;
  name: string;
  avatarUrl?: string;
}

export interface User {
  id: number | string;
  username: string;
  displayName?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  createdAt?: string;
}

export interface ProfileResponse extends User {
  stats?: {
    posts?: number;
    followers?: number;
    following?: number;
    likes?: number;
  };
  counts?: {
    post?: number;
    followers?: number;
    following?: number;
    likes?: number;
  };
}

// User in a likes list – may also carry follow state
export interface LikeUser {
  id: number | string;
  username: string;
  displayName?: string;
  name?: string;
  avatarUrl?: string;
  isFollowing?: boolean;
}

// =====================
// Post Types
// =====================

export interface Post {
  /** API returns numeric IDs; coerced to string where path params need it */
  id: number | string;
  imageUrl: string;
  caption: string;
  author: User;

  // API field names (actual shape from backend)
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  savedByMe?: boolean;

  createdAt: string;
}

// =====================
// Comment Types
// =====================

export interface Comment {
  id: string;
  /** API may return `content` or `text` – handle both in components */
  content?: string;
  text?: string;
  author: User;
  postId: string;
  createdAt: string;
}

// =====================
// Auth Types
// =====================

export interface AuthUser {
  id: number | string;
  username: string;
  displayName?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user?: User;
  [key: string]: unknown;
}

// =====================
// Pagination & API Types
// =====================

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
