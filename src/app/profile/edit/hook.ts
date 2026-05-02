"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useRedux";
import { updateUser } from "@/store/authSlices";
import { extractData } from "@/lib/apiUtils";
import type { AuthUser } from "@/types";
import { editProfileApi } from "./api";
import type { EditProfileForm } from "./type";

export function useEditProfile() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: EditProfileForm & { avatarFile?: File | null }) => {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("phone", form.phone);
      formData.append("bio", form.bio);
      if (form.avatarFile) formData.append("avatar", form.avatarFile);
      return editProfileApi.updateMe(formData);
    },
    onSuccess: (res, variables) => {
      const updated = extractData<AuthUser>(res) || (res as unknown as AuthUser);
      dispatch(
        updateUser({
          name: updated.name ?? variables.name,
          username: updated.username ?? variables.username,
          phone: updated.phone ?? variables.phone,
          bio: updated.bio ?? variables.bio,
          avatarUrl: updated.avatarUrl ?? undefined,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/profile");
    },
  });
}
