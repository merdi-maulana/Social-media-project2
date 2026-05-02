"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createApi } from "./api";

export function useCreatePost(onSuccess?: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createApi.createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["me", "posts"] });
      onSuccess?.();
      setTimeout(() => router.push("/feed"), 1500);
    },
  });
}
