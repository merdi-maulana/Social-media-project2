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

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-z0-9_]+$/, "Lowercase, numbers, underscores only"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(9, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full h-12 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 ease-in-out border border-white/10 bg-white/[0.07] hover:border-white/25 hover:bg-white/10 focus:border-purple-500/60 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/30 focus:shadow-[0_0_15px_rgba(123,47,242,0.15)]";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = data;
      return authService.register(payload);
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

  return (
    <div className="rounded-2xl px-10 py-10 bg-black/80 backdrop-blur-2xl border border-neutral-900">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-6">
        <Image src={logo} alt="Logo" width={28} height={28} />
        <span className="text-white text-2xl font-bold">Sociality</span>
      </div>

      {/* Heading */}
      <h1 className="text-white text-2xl font-bold text-center mb-8">
        Register
      </h1>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-5"
      >
        {/* Name */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">Name</label>
          <input
            {...register("name")}
            placeholder="Enter your name"
            autoComplete="name"
            className={inputClass}
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">Username</label>
          <input
            {...register("username")}
            placeholder="Enter your username"
            autoComplete="username"
            className={inputClass}
          />
          {errors.username && (
            <p className="text-xs text-red-400">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className={inputClass}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Number Phone */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">
            Number Phone
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="Enter your number phone"
            autoComplete="tel"
            className={inputClass}
          />
          {errors.phone && (
            <p className="text-xs text-red-400">{errors.phone.message}</p>
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
              autoComplete="new-password"
              className={`${inputClass} pr-12`}
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Enter your confirm password"
              autoComplete="new-password"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirm ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
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
              "Registration failed. Try a different username or email."}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-11 bg-primary-300 rounded-full text-white font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {mutation.isPending ? <LoadingSpinner size="sm" /> : "Submit"}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-neutral-50 mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-200 font-semibold hover:text-purple-300 transition-colors"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
