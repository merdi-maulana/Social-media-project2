"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, MessageCircle, Send, Bookmark, Trash2, X, Smile,
} from "lucide-react";
import { extractData } from "@/lib/apiUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ErrorBanner } from "@/components/shared/EmptyState";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useRedux";
import type { Post, Comment } from "@/types";
import { usePostDetail, usePostActions, useComments, useAddComment, useDeleteComment } from "./hook";

const EMOJIS = ["😄","😂","🥰","😎","🙂","😋","🤩","😜","🤗","😘","😡","🥲","😤","😭","😏"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const postId = params.id as string;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push("/login");
  }, [mounted, isAuthenticated, router]);

  const { data: postData, isLoading, isError, refetch } = usePostDetail(
    postId,
    mounted && isAuthenticated,
  );

  if (!mounted || !isAuthenticated) return null;

  const post = extractData<Post>(postData);

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-neutral-800 rounded" />
              <div className="h-2 w-16 bg-neutral-800 rounded" />
            </div>
          </div>
          <div className="w-full aspect-square bg-neutral-900 rounded-md" />
          <div className="h-3 w-48 bg-neutral-800 rounded" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <ErrorBanner onRetry={() => refetch()} />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Post not found</p>
        <button onClick={() => router.push("/feed")} className="mt-4 text-purple-400 hover:underline text-sm">
          Back to feed
        </button>
      </main>
    );
  }

  return (
    <>
      <main className="max-w-2xl mx-auto pb-24 px-4">
        <SinglePost post={post} onCommentClick={() => setCommentModalOpen(true)} />
      </main>

      {commentModalOpen && (
        <DesktopCommentModal post={post} onClose={() => setCommentModalOpen(false)} />
      )}
    </>
  );
}

// ─── Single Post ──────────────────────────────────────────────────────────────

function SinglePost({ post, onCommentClick }: { post: Post; onCommentClick: () => void }) {
  const [showMore, setShowMore] = useState(false);
  const {
    liked, likesCount, saved, isOwner,
    handleLike, handleSave, deleteMutation, likeMutation, saveMutation,
  } = usePostActions(post);

  const author = post.author;
  const displayName = author?.name || author?.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const isLong = post.caption?.length > 120;

  return (
    <article className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <Link href={`/profile/${author?.username}`} className="flex items-center gap-3 group">
          <Avatar className="ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
            <AvatarImage src={author?.avatarUrl} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white text-sm font-semibold group-hover:text-purple-400 transition-colors">{displayName}</p>
            <p className="text-gray-500 text-xs">{formatDate(post.createdAt)}</p>
          </div>
        </Link>
        {isOwner && (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full aspect-square bg-neutral-900 rounded-md relative overflow-hidden">
          <Image src={post.imageUrl} alt={post.caption || "Post"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" priority />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all active:scale-90 disabled:opacity-50", liked ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:text-red-500 hover:bg-red-500/10")}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
            <span>{likesCount}</span>
          </button>
          <button onClick={onCommentClick} className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentCount ?? 0}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className={cn("p-2 rounded-xl transition-all active:scale-90 disabled:opacity-50", saved ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5")}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-white")} />
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="pt-1.5 text-sm leading-relaxed">
          <Link href={`/profile/${author?.username}`} className="font-semibold text-white mr-1 hover:underline">
            {author?.username}
          </Link>
          <span className="text-gray-300">
            {isLong && !showMore ? post.caption.slice(0, 120) + "..." : post.caption}
          </span>
          {isLong && (
            <button onClick={() => setShowMore((v) => !v)} className="ml-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              {showMore ? "Show less" : "Show More"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Desktop Comment Modal ────────────────────────────────────────────────────

function DesktopCommentModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { data, isLoading } = useComments(post.id);
  const deleteCommentMutation = useDeleteComment(post.id);
  const addCommentMutation = useAddComment(post.id, () => {
    setText("");
    setShowEmoji(false);
  });

  const rawComments = data?.data?.items ?? data?.data ?? data?.items ?? data ?? [];
  const comments: Comment[] = Array.isArray(rawComments) ? rawComments : [];

  const handleSubmit = () => {
    if (!text.trim() || addCommentMutation.isPending) return;
    addCommentMutation.mutate(text);
  };

  const author = post.author;
  const displayName = author?.name || author?.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-neutral-950 rounded-2xl overflow-hidden flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 bg-black/60 rounded-full p-1.5 text-white hover:bg-black/80 transition-colors">
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        {post.imageUrl && (
          <div className="md:w-[55%] shrink-0 bg-black flex items-center justify-center">
            <div className="relative w-full aspect-square md:aspect-auto md:h-full">
              <Image src={post.imageUrl} alt={post.caption || "Post"} fill className="object-contain md:object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
            </div>
          </div>
        )}

        {/* Comments panel */}
        <div className="flex-1 flex flex-col min-h-0 md:max-h-[90vh]">
          {/* Post info */}
          <div className="px-5 pt-5 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/10">
                <AvatarImage src={author?.avatarUrl} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white text-sm font-semibold">{displayName}</p>
                <p className="text-gray-500 text-xs">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            {post.caption && <p className="text-gray-200 text-sm leading-relaxed">{post.caption}</p>}
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <h3 className="text-white font-bold mb-4">Comments</h3>

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-neutral-800 rounded" />
                      <div className="h-3 w-full bg-neutral-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && comments.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No comments yet. Be the first!</p>
            )}

            <div className="space-y-4">
              {comments.map((comment) => {
                const cAuthor = comment.author;
                const cName = cAuthor?.name || cAuthor?.username || "User";
                const cInitials = cName.slice(0, 2).toUpperCase();
                const body = comment.content ?? comment.text ?? "";
                const isCommentOwner = !!user && user.username === cAuthor?.username;
                const isDeleting = deleteCommentMutation.isPending &&
                  deleteCommentMutation.variables === String(comment.id);
                return (
                  <div
                    key={comment.id}
                    className={cn(
                      "flex gap-3 border-b border-white/5 pb-4 transition-opacity",
                      isDeleting && "opacity-40"
                    )}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={cAuthor?.avatarUrl} alt={cName} />
                      <AvatarFallback className="text-xs">{cInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white text-sm font-semibold">{cName}</p>
                        {comment.createdAt && <p className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</p>}
                        {isCommentOwner && (
                          <button
                            onClick={() => {
                              if (!deleteCommentMutation.isPending)
                                deleteCommentMutation.mutate(String(comment.id));
                            }}
                            disabled={isDeleting}
                            className="ml-auto p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:cursor-not-allowed"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mt-0.5 break-words">{body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emoji picker */}
          {showEmoji && (
            <div className="px-5 pb-2 flex flex-wrap gap-2 border-t border-white/5 pt-2">
              {EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => { setText((t) => t + emoji); inputRef.current?.focus(); }} className="text-2xl hover:scale-125 transition-transform">
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-white/10 px-4 py-3 flex items-center gap-3 shrink-0">
            <button onClick={() => setShowEmoji((v) => !v)} className="text-gray-400 hover:text-white transition-colors">
              <Smile className="h-5 w-5" />
            </button>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || addCommentMutation.isPending}
              className="text-sm font-semibold text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-all"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
