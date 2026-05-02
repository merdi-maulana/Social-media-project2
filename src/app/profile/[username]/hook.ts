"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendProfileApi } from "./api";

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

export function useFollowToggle(username: string, isFollowing: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      isFollowing
        ? friendProfileApi.unfollow(username)
        : friendProfileApi.follow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", username, "profile"] });
      queryClient.invalidateQueries({ queryKey: ["me", "following"] });
      queryClient.invalidateQueries({ queryKey: ["me", "profile"] });
    },
  });
}
