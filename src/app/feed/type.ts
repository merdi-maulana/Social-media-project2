import { AuthUser } from "@/types";

export interface PostResponse {
  data: Post[];
  pagination: number;
}

export interface Post {
  id: string | number;
  caption?: string;
  imageUrl?: string;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  createdAt: string;
  user: AuthUser;
}

export interface Comment {
  id: string | number;
  text: string;
  user: AuthUser;
  createdAt: string;
}

