"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useRedux";
import { setCredentials } from "@/store/authSlices";
import { extractData } from "@/lib/apiUtils";
import type { AuthResponse, AuthUser } from "@/types";
import { loginApi } from "./api";
import type { LoginFormData } from "./type";

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginFormData) => loginApi.login(data),
    onSuccess: (raw) => {
      const data = extractData<AuthResponse>(raw) || (raw as AuthResponse);
      const token = data.token || data.accessToken || "";
      const user = (data.user || data) as AuthUser;
      if (!token) console.warn("[Login] No token in response:", raw);
      dispatch(setCredentials({ user, token }));
      router.push("/feed");
    },
  });
}
