"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendProfileApi } from "./api";
import type { ProfileResponse } from "@/types";

export function useFriendProfile(username: string, enabled: boolean) {
  return useQuery({
    queryKey: ["user", username, "profile"],
    queryFn: () => friendProfileApi.getProfile(username),
    enabled: enabled && !!username,
  });
}

export function useFriendPosts(username: string, enabled: boolean) {
  return useQuery({
    queryKey: ["user", username, "posts"],
    queryFn: () => friendProfileApi.getUserPosts(username, 1, 20),
    enabled: enabled && !!username,
  });
}

export function useFriendLikes(username: string, enabled: boolean) {
  return useQuery({
    queryKey: ["user", username, "likes"],
    queryFn: () => friendProfileApi.getUserLikes(username, 1, 20),
    enabled: enabled && !!username,
  });
}

// ─── Follow / Unfollow — Optimistic UI + idempotent guard ────────────────────

export function useFollowToggle(username: string) {
  const queryClient = useQueryClient();
  const profileKey = ["user", username, "profile"];

  return useMutation({
    mutationFn: (isCurrentlyFollowing: boolean) =>
      isCurrentlyFollowing
        ? friendProfileApi.unfollow(username)
        : friendProfileApi.follow(username),

    onMutate: async (isCurrentlyFollowing: boolean) => {
      // Cancel any in-flight refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: profileKey });

      // Snapshot previous data for rollback
      const previousProfile = queryClient.getQueryData<ProfileResponse>(profileKey);

      // Optimistically update isFollowing + followers counter
      queryClient.setQueryData<ProfileResponse>(profileKey, (old) => {
        if (!old) return old;
        const delta = isCurrentlyFollowing ? -1 : 1;
        return {
          ...old,
          isFollowing: !isCurrentlyFollowing,
          counts: old.counts
            ? {
                ...old.counts,
                followers: Math.max(0, (old.counts.followers ?? 0) + delta),
              }
            : old.counts,
        };
      });

      return { previousProfile };
    },

    onError: (_err, _vars, context) => {
      // Rollback to previous data on failure
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKey, context.previousProfile);
      }
    },

    onSettled: () => {
      // Always re-sync from server after mutation completes
      queryClient.invalidateQueries({ queryKey: profileKey });
      queryClient.invalidateQueries({ queryKey: ["me", "profile"] });
    },
  });
}
