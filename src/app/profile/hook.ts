"use client";

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "./api";

export function useMyProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["me", "profile"],
    queryFn: () => profileApi.getMe(),
    enabled,
  });
}

export function useMyPosts(enabled: boolean) {
  return useQuery({
    queryKey: ["me", "posts"],
    queryFn: () => profileApi.getMyPosts(1, 20),
    enabled,
  });
}

export function useMySaved(enabled: boolean) {
  return useQuery({
    queryKey: ["me", "saved"],
    queryFn: () => profileApi.getMySaved(1, 20),
    enabled,
  });
}
