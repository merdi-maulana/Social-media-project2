"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export function LoadingSpinner({
  className,
  size = "md",
  fullPage = false,
}: LoadingSpinnerProps) {
  const sizeMap = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2
          className={cn("animate-spin text-primary", sizeMap[size], className)}
        />
      </div>
    );
  }

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeMap[size], className)}
    />
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function PostCardSkeleton() {
  return (
    <div className="pb-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3 px-4 pt-3">
        <div className="h-10 w-10 rounded-full bg-neutral-800" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-32 bg-neutral-800 rounded" />
          <div className="h-3 w-20 bg-neutral-800 rounded" />
        </div>
      </div>
      <div className="h-64 w-full bg-neutral-800" />
      <div className="px-4 space-y-2">
        <div className="h-3 w-full bg-neutral-800 rounded" />
        <div className="h-3 w-3/4 bg-neutral-800 rounded" />
      </div>
      <div className="flex gap-4 px-4">
        <div className="h-5 w-16 bg-neutral-800 rounded" />
        <div className="h-5 w-16 bg-neutral-800 rounded" />
      </div>
    </div>
  );
}
