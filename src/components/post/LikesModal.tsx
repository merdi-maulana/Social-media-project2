"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsService, usersService } from "@/services";
import { Post, LikeUser } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { X, CheckCircle2 } from "lucide-react";

interface LikesModalProps {
  post: Post;
  onClose: () => void;
}

export function LikesModal({ post, onClose }: LikesModalProps) {
  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () => postsService.getLikes(String(post.id)),
  });

  // Normalize API response shape
  const rawUsers = data?.data?.items ?? data?.data ?? data?.items ?? data ?? [];
  const users: LikeUser[] = Array.isArray(rawUsers) ? rawUsers : [];

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-neutral-950 rounded-t-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Post image preview */}
        {post.imageUrl && (
          <div className="relative w-full aspect-video rounded-t-3xl overflow-hidden shrink-0">
            <Image
              src={post.imageUrl}
              alt="Post preview"
              fill
              className="object-cover"
            />
            <button
              onClick={onClose}
              className="absolute bottom-3 right-3 bg-black/60 rounded-full p-1.5 text-white hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Users list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h2 className="text-white font-bold text-lg mb-4">Likes</h2>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-neutral-800 rounded" />
                    <div className="h-3 w-16 bg-neutral-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && users.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              No likes yet.
            </p>
          )}

          {/* User rows */}
          <div className="space-y-3">
            {users.map((likeUser) => (
              <LikeUserRow
                key={likeUser.id}
                user={likeUser}
                postId={String(post.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LikeUserRow ─────────────────────────────────────────────────────────────

interface LikeUserRowProps {
  user: LikeUser;
  postId: string;
}

function LikeUserRow({ user, postId }: LikeUserRowProps) {
  const queryClient = useQueryClient();

  const displayName = user.displayName || user.name || user.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const isFollowing = user.isFollowing ?? false;

  const followMutation = useMutation({
    mutationFn: () =>
      isFollowing
        ? usersService.unfollow(user.username)
        : usersService.follow(user.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", postId] });
    },
  });

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={user.avatarUrl} alt={displayName} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          {displayName}
        </p>
        <p className="text-gray-500 text-xs truncate">@{user.username}</p>
      </div>

      <button
        onClick={() => followMutation.mutate()}
        disabled={followMutation.isPending}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-40",
          isFollowing
            ? "border border-white/20 text-white hover:border-white/40 flex items-center gap-1.5"
            : "bg-blue-600 text-white hover:bg-blue-500",
        )}
      >
        {isFollowing ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Following
          </>
        ) : (
          "Follow"
        )}
      </button>
    </div>
  );
}
