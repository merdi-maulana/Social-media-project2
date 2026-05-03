"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types";
import { Heart, MessageCircle, Send, Bookmark, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatDate } from "@/lib/utils";
import { CommentsModal } from "./CommentsModal";
import { LikesModal } from "./LikesModal";
import { usePostActions } from "./usePostActions";

interface PostCardProps {
  post: Post;
  queryKey: string[];
}

export function PostCard({ post, queryKey }: PostCardProps) {
  const [showMore, setShowMore] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);

  const {
    liked,
    likesCount,
    saved,
    isOwner,
    toastMessage,
    handleLike,
    handleSave,
    deleteMutation,
  } = usePostActions({ post, queryKey });

  // ─── Derived values ───────────────────────────────────────────────────────

  const author = post.author;
  const displayName = author?.name || author?.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
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
            className={cn(
              "p-2 rounded-xl transition-all active:scale-90 disabled:opacity-50",
              saved
                ? "text-yellow-400 bg-yellow-400/10"
                : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10",
            )}
            aria-label={saved ? "Unsave post" : "Save post"}
            data-saved={saved ? "true" : "false"}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-white")} />
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

      {/* ── Toast Notification ─────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium shadow-xl border",
              toastMessage.isError
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-neutral-900 text-white border-white/10"
            )}
          >
            {toastMessage.text}
          </div>
        </div>
      )}
    </>
  );
}
