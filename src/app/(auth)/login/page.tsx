"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import logo from "@/assets/svg/Logo.svg";
import { loginSchema, type LoginFormData } from "./type";
import { useLogin } from "./hook";

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const mutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  return (
    <div className="rounded-2xl px-10 py-10 bg-black/80 backdrop-blur-2xl border border-neutral-900">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-6">
        <Image src={logo} alt="Logo" width={28} height={28} />
        <span className="text-white text-2xl font-bold">Sociality</span>
      </div>

      <h1 className="text-white text-2xl font-bold text-center mb-8">
        Welcome Back!
      </h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">Email</label>
          <input
            {...register("email")}
            type="email"
            data-testid="login-email"
            placeholder="Enter your email"
            autoComplete="email"
            className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 border border-white/10 bg-white/[0.07] hover:border-white/25 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/30"
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
              data-testid="login-password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full h-12 px-4 pr-12 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 border border-white/10 bg-white/[0.07] hover:border-white/25 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/30"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPass ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* API Error */}
        {mutation.isError && (
          <div className="text-red-400 text-sm px-4 py-3 rounded-xl bg-red-500/10">
            {(mutation.error as { response?: { data?: { message?: string } } })
              ?.response?.data?.message || "Invalid email or password. Please try again."}
          </div>
        )}

        <button
          type="submit"
          data-testid="login-submit"
          disabled={mutation.isPending}
          className="w-full h-11 bg-primary-300 rounded-full text-white font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {mutation.isPending ? <LoadingSpinner size="sm" /> : "Login"}
        </button>

        <p className="text-center text-sm text-neutral-50 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary-200 font-semibold hover:text-purple-300 transition-colors">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
