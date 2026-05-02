"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useRedux";
import { setCredentials } from "@/store/authSlices";
import { extractData } from "@/lib/apiUtils";
import type { AuthResponse, AuthUser } from "@/types";
import { registerApi } from "./api";
import type { RegisterFormData } from "./type";

export function useRegister() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = data;
      return registerApi.register(payload);
    },
    onSuccess: (raw) => {
      const data = extractData<AuthResponse>(raw) || (raw as AuthResponse);
      const token = data.token || data.accessToken || "";
      const user = (data.user || data) as AuthUser;
      if (!token) console.warn("[Register] No token in response:", raw);
      dispatch(setCredentials({ user, token }));
      router.push("/feed");
    },
  });
}
