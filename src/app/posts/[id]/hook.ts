"use client";

import { useQuery } from "@tanstack/react-query";
import { postDetailApi } from "./api";

// ─── Post Detail Query ────────────────────────────────────────────────────────

export function usePostDetail(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => postDetailApi.getPost(postId),
    enabled: enabled && !!postId,
  });
}
