"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsService } from "@/services";
import { Comment } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { X, Smile, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorBanner } from "@/components/shared/EmptyState";

const EMOJIS = [
  "😄", "😂", "🥰", "😎", "🙂", "😋",
  "🤩", "😜", "🤗", "😘", "😡", "🥲",
  "😤", "😭", "😏",
];

interface CommentsModalProps {
  id: number | string;
  imageUrl?: string;
  caption?: string;
  createdAt: string;
  author: {
    id?: number | string;
    username?: string;
    name?: string;
    avatarUrl?: string;
  };
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  onClose: () => void;
  queryKey: string[];
  onLike?: (e?: React.MouseEvent) => void;
  onSave?: (e?: React.MouseEvent) => void;
}

export function CommentsModal({
  id,
  imageUrl,
  caption,
  createdAt,
  author,
  likeCount = 0,
  commentCount = 0,
  likedByMe = false,
  savedByMe = false,
  onClose,
  queryKey,
  onLike,
  onSave,
}: CommentsModalProps) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = author?.name || author?.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => postsService.getComments(String(id)),
  });

  const addCommentMutation = useMutation({
    mutationFn: () => postsService.addComment(String(id), commentText),
    onSuccess: () => {
      setCommentText("");
      setShowEmoji(false);
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const rawComments =
    data?.data?.comments ??
    data?.data?.items ??
    data?.data ??
    data?.comments ??
    data ??
    [];
  const comments: Comment[] = Array.isArray(rawComments) ? rawComments : [];

  const handleSubmit = () => {
    if (!commentText.trim() || addCommentMutation.isPending) return;
    addCommentMutation.mutate();
  };

  /* ─────────────────── Shared: Right-side panel content ─────────────────── */
  const rightPanel = (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Post author + caption */}
      <div className="px-5 pt-5 pb-4 border-b border-white/5 shrink-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={author?.avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs bg-neutral-800 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-semibold">{displayName}</p>
              <p className="text-gray-500 text-xs">{formatDate(createdAt)}</p>
            </div>
          </div>
          {/* Close button — desktop only */}
          <button
            onClick={onClose}
            className="hidden md:flex p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {caption && (
          <p className="text-gray-200 text-sm leading-relaxed">{caption}</p>
        )}
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h2 className="text-white font-bold text-sm mb-4">Comments</h2>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-neutral-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-neutral-800 rounded" />
                  <div className="h-3 w-full bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && <ErrorBanner onRetry={() => refetch()} />}

        {!isLoading && !isError && comments.length === 0 && (
          <EmptyState type="comments" />
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-5 pb-3 flex flex-wrap gap-2 shrink-0">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setCommentText((t) => t + emoji);
                inputRef.current?.focus();
              }}
              className="text-2xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Action bar (likes/comments/share/save) */}
      <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={onLike}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-sm font-medium transition-all",
              likedByMe
                ? "text-red-500"
                : "text-gray-400 hover:text-red-400"
            )}
          >
            <Heart className={cn("h-5 w-5", likedByMe && "fill-red-500")} />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-sm font-medium text-gray-400">
            <MessageCircle className="h-5 w-5" />
            <span>{commentCount}</span>
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <Send className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={onSave}
          className={cn(
            "p-1.5 rounded-xl transition-all",
            savedByMe ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
          )}
        >
          <Bookmark className={cn("h-5 w-5", savedByMe && "fill-yellow-400")} />
        </button>
      </div>

      {/* Comment input */}
      <div className="border-t border-white/10 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle emoji picker"
        >
          <Smile className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!commentText.trim() || addCommentMutation.isPending}
          className="text-sm font-semibold text-[#7F51F9] hover:text-[#6B3EE0] disabled:opacity-40 transition-all"
        >
          Post
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* ── Mobile: bottom sheet ───────────────────────────────────────────── */}
      <div
        className="md:hidden absolute bottom-0 left-0 right-0 max-h-[85vh] bg-neutral-950 rounded-t-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        {rightPanel}
      </div>

      {/* ── Desktop: centred modal with image + right panel ─────────────────── */}
      <div
        className="hidden md:flex absolute inset-0 items-center justify-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button outside the card */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-black/60 text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {/* Left: image */}
          <div className="flex-1 relative bg-black">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={caption || "Post"}
                fill
                className="object-cover"
                sizes="60vw"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://picsum.photos/seed/${id}/800/800`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-gray-600 text-sm">
                No Image
              </div>
            )}
          </div>

          {/* Right: info + comments */}
          <div className="w-[360px] shrink-0 flex flex-col">
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Comment Row ─────────────────────────────────────────────────────────────

interface CommentRowProps {
  comment: Comment;
}

function CommentRow({ comment }: CommentRowProps) {
  const author = comment.author;
  const displayName =
    author?.displayName || author?.name || author?.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const body = comment.content ?? comment.text ?? "";

  return (
    <div className="flex gap-3 pb-4">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={author?.avatarUrl} alt={displayName} />
        <AvatarFallback className="text-xs bg-neutral-800 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white text-sm font-semibold">{displayName}</p>
          {comment.createdAt && (
            <p className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</p>
          )}
        </div>
        <p className="text-gray-300 text-sm mt-0.5 wrap-break-word">{body}</p>
      </div>
    </div>
  );
}
