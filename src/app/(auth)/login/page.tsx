"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "@/hooks/useRedux";
import { setCredentials } from "@/store/authSlices";
import { authService } from "@/services/authServices";
import { extractData } from "@/lib/apiUtils";
import { AuthResponse, AuthUser } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/svg/Logo.svg";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (raw) => {
      const data = extractData<AuthResponse>(raw) || (raw as AuthResponse);
      const token = data.token || data.accessToken || "";
      const user = (data.user || data) as AuthUser;
      if (!token) console.warn("[Login] No token in response:", raw);
      dispatch(setCredentials({ user, token }));
      router.push("/feed");
    },
  });

  return (
    <div className="rounded-2xl px-10 py-10 bg-black/80 backdrop-blur-2xl border border-neutral-900">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-6">
        <Image src={logo} alt="Logo" width={28} height={28} />
        <span className="text-white text-2xl font-bold">Sociality</span>
      </div>

      {/* Heading */}
      <h1 className="text-white text-2xl font-bold text-center mb-8">
        Welcome Back!
      </h1>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-5"
      >
        {/* Email */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 ease-in-out border border-white/10 bg-white/[0.07] hover:border-white/25 hover:bg-white/10 focus:border-purple-500/60 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/30 focus:shadow-[0_0_15px_rgba(123,47,242,0.15)]"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full h-12 px-4 pr-12 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 ease-in-out border border-white/10 bg-white/[0.07] hover:border-white/25 hover:bg-white/10 focus:border-purple-500/60 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/30 focus:shadow-[0_0_15px_rgba(123,47,242,0.15)]"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPass ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Error */}
        {mutation.isError && (
          <div className="text-red-400 text-sm px-4 py-3 rounded-xl bg-red-500/10">
            {(
              mutation.error as {
                response?: { data?: { message?: string } };
              }
            )?.response?.data?.message ||
              "Invalid email or password. Please try again."}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-11 bg-primary-300 rounded-full text-white font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {mutation.isPending ? <LoadingSpinner size="sm" /> : "Login"}
        </button>

        {/* Register link */}
        <p className="text-center text-sm text-neutral-50 mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary-200 font-semibold hover:text-purple-300 transition-colors"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
