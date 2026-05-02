"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useRedux";
import type { Post } from "@/types";
import { postDetailApi } from "./api";

// ─── Post Detail Query ────────────────────────────────────────────────────────

export function usePostDetail(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => postDetailApi.getPost(postId),
    enabled: enabled && !!postId,
  });
}

// ─── Comments Query ───────────────────────────────────────────────────────────

export function useComments(postId: string | number) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => postDetailApi.getComments(String(postId)),
  });
}

export function useAddComment(postId: string | number, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => postDetailApi.addComment(String(postId), text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", String(postId)] });
      onSuccess?.();
    },
  });
}

// ─── Post Actions (Like / Save / Delete) ─────────────────────────────────────

export function usePostActions(post: Post) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [likesCount, setLikesCount] = useState(post.likeCount ?? 0);
  const [saved, setSaved] = useState(post.savedByMe ?? false);

  const likeMutation = useMutation({
    mutationFn: () =>
      liked
        ? postDetailApi.unlikePost(String(post.id))
        : postDetailApi.likePost(String(post.id)),
    onMutate: () => {
      setLiked((v) => !v);
      setLikesCount((c) => (liked ? c - 1 : c + 1));
    },
    onError: () => {
      setLiked((v) => !v);
      setLikesCount((c) => (liked ? c + 1 : c - 1));
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      saved
        ? postDetailApi.unsavePost(String(post.id))
        : postDetailApi.savePost(String(post.id)),
    onMutate: () => setSaved((s) => !s),
    onError: () => setSaved((s) => !s),
  });

  const deleteMutation = useMutation({
    mutationFn: () => postDetailApi.deletePost(String(post.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["me", "posts"] });
      if (post.author?.username) {
        queryClient.invalidateQueries({
          queryKey: ["user", post.author.username, "posts"],
        });
      }
      router.push("/feed");
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) return router.push("/login");
    if (!likeMutation.isPending) likeMutation.mutate();
  };

  const handleSave = () => {
    if (!isAuthenticated) return router.push("/login");
    if (!saveMutation.isPending) saveMutation.mutate();
  };

  const isOwner = !!user && user.username === post.author?.username;

  return {
    liked,
    likesCount,
    saved,
    isOwner,
    handleLike,
    handleSave,
    deleteMutation,
    likeMutation,
    saveMutation,
  };
}
