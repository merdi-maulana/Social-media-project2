"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { postsService } from "@/services";
import { Post } from "@/types";
import { useAuth } from "@/hooks/useRedux";
import { useRouter, usePathname } from "next/navigation";
import { AxiosError } from "axios";

interface UsePostActionsProps {
  post: Post;
  queryKey: string[];
}

// Minimal type for extracting id from saved posts array
interface SavedItem {
  id: string | number;
  post?: { id: string | number };
  postId?: string | number;
}

export function usePostActions({ post, queryKey }: UsePostActionsProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [toastMessage, setToastMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { data: savedData } = useQuery({
    queryKey: ["me", "saved"],
    queryFn: () => postsService.getMySaved(1, 50),
    enabled: isAuthenticated,
  });

  const isActuallySaved = useMemo(() => {
    if (post.savedByMe !== undefined) return post.savedByMe;
    if (!savedData) return false;

    // Safely cast to access nested data properties without using 'any'
    const dataObj = savedData as Record<string, unknown>;
    const dataField = dataObj?.data as Record<string, unknown> | undefined;

    const items = (dataField?.posts || dataField?.items || dataObj?.data || dataObj?.items || savedData || []) as SavedItem[];

    return items.some(
      (item) =>
        String(item.id) === String(post.id) ||
        String(item.post?.id) === String(post.id) ||
        String(item.postId) === String(post.id)
    );
  }, [savedData, post.id, post.savedByMe]);

  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [likesCount, setLikesCount] = useState(post.likeCount ?? 0);
  const [saved, setSaved] = useState(isActuallySaved);

  useEffect(() => {
    setLiked(post.likedByMe ?? false);
    setLikesCount(post.likeCount ?? 0);
  }, [post.likedByMe, post.likeCount]);

  useEffect(() => {
    setSaved(isActuallySaved);
  }, [isActuallySaved]);

  const likeMutation = useMutation({
    mutationFn: (currentlyLiked: boolean) =>
      currentlyLiked
        ? postsService.unlikePost(String(post.id))
        : postsService.likePost(String(post.id)),
    onMutate: (currentlyLiked) => {
      setLiked(!currentlyLiked);
      setLikesCount((prev) => (currentlyLiked ? prev - 1 : prev + 1));
    },
    onError: (err: unknown, currentlyLiked) => {
      const error = err as AxiosError<{ message: string }>;
      setLiked(currentlyLiked);
      setLikesCount((prev) => (currentlyLiked ? prev + 1 : prev - 1));
      showToast(error?.response?.data?.message || error?.message || "Failed to update like", true);
    },
    onSuccess: (_, currentlyLiked) => {
      showToast(currentlyLiked ? "Post unliked" : "Post liked", false);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (currentlySaved: boolean) =>
      currentlySaved
        ? postsService.unsavePost(String(post.id))
        : postsService.savePost(String(post.id)),
    onMutate: (currentlySaved) => {
      setSaved(!currentlySaved);
    },
    onError: (err: unknown, currentlySaved) => {
      const error = err as AxiosError<{ message: string }>;
      setSaved(currentlySaved);
      showToast(error?.response?.data?.message || error?.message || "Failed to update save", true);
    },
    onSuccess: (_, currentlySaved) => {
      showToast(currentlySaved ? "Post unsaved" : "Post saved", false);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["me", "saved"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => postsService.deletePost(String(post.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["me", "posts"] });
    },
  });

  const handleLike = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    if (likeMutation.isPending) return;
    likeMutation.mutate(liked);
  };

  const handleSave = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    if (saveMutation.isPending) return;
    saveMutation.mutate(saved);
  };

  const isOwner = !!user && user.username === post.author?.username;

  return {
    liked,
    likesCount,
    saved,
    isOwner,
    toastMessage,
    handleLike,
    handleSave,
    deleteMutation,
    likeMutation,
    saveMutation,
  };
}
