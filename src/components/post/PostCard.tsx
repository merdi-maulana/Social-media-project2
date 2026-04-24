"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsService } from "@/services";
import { Post } from "@/types";
import { useAuth } from "@/hooks/useRedux";
import { usePathname, useRouter } from "next/navigation";
import { Heart, MessageCircle, Send, Bookmark, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatDate } from "@/lib/utils";
import { CommentsModal } from "./CommentsModal";
import { LikesModal } from "./LikesModal";

interface PostCardProps {
  post: Post;
  queryKey: string[];
}

export function PostCard({ post, queryKey }: PostCardProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Optimistic local state synced with server
  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [likesCount, setLikesCount] = useState(post.likeCount ?? 0);
  const [saved, setSaved] = useState(post.savedByMe ?? false);
  const [showMore, setShowMore] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setLiked(post.likedByMe ?? false);
    setLikesCount(post.likeCount ?? 0);
    setSaved(post.savedByMe ?? false);
  }, [post.likedByMe, post.likeCount, post.savedByMe]);

  // ─── Mutations ────────────────────────────────────────────────────────────

  // Like → POST jika belum liked, DELETE jika sudah liked
  const likeMutation = useMutation({
    mutationFn: () =>
      liked
        ? postsService.unlikePost(String(post.id))
        : postsService.likePost(String(post.id)),
    onMutate: () => {
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    },
    onError: () => {
      // Revert on error
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Save → POST jika belum saved, DELETE jika sudah saved
  const saveMutation = useMutation({
    mutationFn: () =>
      saved
        ? postsService.unsavePost(String(post.id))
        : postsService.savePost(String(post.id)),
    onMutate: () => {
      setSaved((prev) => !prev);
    },
    onError: () => {
      setSaved((prev) => !prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["me", "saved"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => postsService.deletePost(String(post.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["me", "posts"] });
    },
  });

  // ─── Auth-gated handlers ──────────────────────────────────────────────────

  const handleLike = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    if (likeMutation.isPending) return;
    likeMutation.mutate();
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    if (saveMutation.isPending) return;
    saveMutation.mutate();
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const author = post.author;
  const displayName = author?.name || author?.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const isOwner = !!user && user.username === author?.username;
  const isLong = post.caption?.length > 120;

  return (
    <>
      <article className="pb-4">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between py-3">
          <Link
            href={`/profile/${author?.username}`}
            className="flex items-center gap-3 group"
          >
            <Avatar className="ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
              <AvatarImage src={author?.avatarUrl} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-semibold group-hover:text-primary transition-colors">
                {displayName}
              </p>
              <p className="text-gray-500 text-xs">
                @{author?.username} · {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>

          {isOwner && (
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
              aria-label="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Post image ─────────────────────────────────────────────────── */}
        {post.imageUrl && (
          <Link href={`/posts/${post.id}`}>
            <div className="w-full aspect-square bg-neutral-900 rounded-md relative overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.caption || "Post"}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 600px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://picsum.photos/seed/${post.id}/640/640`;
                }}
              />
            </div>
          </Link>
        )}

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-1">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all active:scale-90 disabled:opacity-50",
                liked
                  ? "text-red-500 bg-red-500/10"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-500/10",
              )}
              aria-label="Like post"
            >
              <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
              <span>{likesCount}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Open comments"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentCount ?? 0}</span>
            </button>

            {/* Share placeholder */}
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Share post"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className={cn(
              "p-2 rounded-xl transition-all active:scale-90 disabled:opacity-50",
              saved
                ? "text-yellow-400 bg-yellow-400/10"
                : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10",
            )}
            aria-label="Save post"
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-yellow-400")} />
          </button>
        </div>

        {/* ── Caption ─────────────────────────────────────────────────────── */}
        {post.caption && (
          <div className="pt-1.5 text-sm leading-relaxed">
            <Link
              href={`/profile/${author?.username}`}
              className="font-semibold text-white mr-1 hover:underline"
            >
              {author?.username}
            </Link>
            <span className="text-gray-300">
              {isLong && !showMore
                ? post.caption.slice(0, 120) + "..."
                : post.caption}
            </span>
            {isLong && (
              <button
                onClick={() => setShowMore((v) => !v)}
                className="ml-1 text-xs font-semibold text-gray-500 hover:text-white transition-colors"
              >
                {showMore ? "Show less" : "more"}
              </button>
            )}
          </div>
        )}
      </article>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {commentsOpen && (
        <CommentsModal
          id={Number(post.id)}
          imageUrl={post.imageUrl}
          caption={post.caption}
          createdAt={post.createdAt}
          author={post.author}
          likeCount={likesCount}
          commentCount={post.commentCount ?? 0}
          likedByMe={liked}
          savedByMe={saved}
          onLike={handleLike}
          onSave={handleSave}
          onClose={() => setCommentsOpen(false)}
          queryKey={queryKey}
        />
      )}
      {likesOpen && (
        <LikesModal post={post} onClose={() => setLikesOpen(false)} />
      )}
    </>
  );
}
