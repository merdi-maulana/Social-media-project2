"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useRedux";
import type { Post, Comment } from "@/types";
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

// ─── Delete Comment — optimistic remove + counter decrement ──────────────────

export function useDeleteComment(postId: string | number) {
  const queryClient = useQueryClient();
  const commentsKey = ["comments", postId];
  const postKey = ["post", String(postId)];

  return useMutation({
    mutationFn: (commentId: string) => postDetailApi.deleteComment(commentId),

    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: commentsKey });
      await queryClient.cancelQueries({ queryKey: postKey });

      // Snapshot for rollback
      const previousComments = queryClient.getQueryData(commentsKey);
      const previousPost = queryClient.getQueryData(postKey);

      // Optimistically remove comment from list
      queryClient.setQueryData(commentsKey, (old: unknown) => {
        if (!old) return old;
        const normalize = (d: unknown): Comment[] => {
          if (Array.isArray(d)) return d;
          const obj = d as any;
          return (
            (obj?.data?.items as Comment[]) ??
            (obj?.data as Comment[]) ??
            (obj?.items as Comment[]) ??
            []
          );
        };
        const list = normalize(old);
        const filtered = list.filter((c) => String(c.id) !== String(commentId));
        // Preserve original shape
        if (Array.isArray(old)) return filtered;
        const obj = old as any;
        if (obj?.data?.items) return { ...obj, data: { ...obj.data, items: filtered } };
        if (obj?.data) return { ...obj, data: filtered };
        return { ...obj, items: filtered };
      });

      // Optimistically decrement commentCount on post
      queryClient.setQueryData(postKey, (old: unknown) => {
        if (!old) return old;
        const obj = old as Record<string, unknown>;
        const post = (obj?.data ?? old) as Post & { data?: Post };
        if (obj?.data) {
          return {
            ...obj,
            data: { ...post, commentCount: Math.max(0, (post.commentCount ?? 1) - 1) },
          };
        }
        return { ...obj, commentCount: Math.max(0, ((obj.commentCount as number) ?? 1) - 1) };
      });

      return { previousComments, previousPost };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousComments) queryClient.setQueryData(commentsKey, context.previousComments);
      if (context?.previousPost) queryClient.setQueryData(postKey, context.previousPost);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      queryClient.invalidateQueries({ queryKey: postKey });
    },
  });
}

// ─── Post Actions (Like / Save / Delete Post) ─────────────────────────────────

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
