"use client";

import {
  ImageOff,
  SearchX,
  BookmarkX,
  Users,
  AlertTriangle,
  MessageSquare,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateType =
  | "feed"
  | "posts"
  | "comments"
  | "likes"
  | "saved"
  | "followers"
  | "search"
  | "generic";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  className?: string;
}

const CONFIGS: Record<
  EmptyStateType,
  { icon: React.ElementType; title: string; description: string }
> = {
  feed: {
    icon: Users,
    title: "Your feed is empty",
    description: "Follow people to see their posts here.",
  },
  posts: {
    icon: ImageOff,
    title: "No posts yet",
    description: "Share your first moment with the world.",
  },
  comments: {
    icon: MessageSquare,
    title: "No comments yet",
    description: "Be the first to comment!",
  },
  likes: {
    icon: Heart,
    title: "No likes yet",
    description: "Posts you love will appear here.",
  },
  saved: {
    icon: BookmarkX,
    title: "Nothing saved yet",
    description: "Bookmark posts to find them here later.",
  },
  followers: {
    icon: Users,
    title: "No followers yet",
    description: "Share your profile to get followers.",
  },
  search: {
    icon: SearchX,
    title: "No results found",
    description: "Try a different search term.",
  },
  generic: {
    icon: AlertTriangle,
    title: "Nothing here",
    description: "Check back later.",
  },
};

export function EmptyState({
  type = "generic",
  title,
  description,
  className,
}: EmptyStateProps) {
  const cfg = CONFIGS[type];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-gray-500" />
      </div>
      <h3 className="text-white font-semibold text-sm mb-1">
        {title ?? cfg.title}
      </h3>
      <p className="text-gray-500 text-xs max-w-xs">
        {description ?? cfg.description}
      </p>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onRetry, className }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-10 text-center",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <p className="text-gray-400 text-sm">
        {message ?? "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
