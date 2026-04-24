"use client";

import Image from "next/image";
import Link from "next/link";
import { Send, Grid3X3, Bookmark, Heart, Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState, ErrorBanner } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ProfileTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface ProfilePost {
  id: number | string;
  imageUrl?: string;
}

interface ProfileCardProps {
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  stats: { label: string; value: number }[];
  /** "edit" renders Edit Profile link; "follow" renders Follow/Following */
  actionType: "edit" | "follow";
  /** Only used when actionType === "follow" */
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  followLoading?: boolean;
  /** Tab config */
  tabs: ProfileTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  /** Posts to show in the grid */
  posts: ProfilePost[];
  emptyLabel?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function ProfileCard({
  displayName,
  username,
  avatarUrl,
  bio,
  stats,
  actionType,
  isFollowing,
  onFollowToggle,
  followLoading,
  tabs,
  activeTab,
  onTabChange,
  posts,
  emptyLabel = "No posts yet",
  isLoading = false,
  isError = false,
  onRetry,
}: ProfileCardProps) {
  return (
    <>
      {/* ── Profile header row ── */}
      <div className="pt-8 flex items-center justify-between gap-4">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-lg bg-neutral-800 text-white">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-bold text-base leading-tight">
              {displayName}
            </p>
            <p className="text-gray-500 text-sm mt-0.5">{username}</p>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {actionType === "edit" ? (
            <Link
              href="/profile/edit"
              className="px-5 py-2 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Edit Profile
            </Link>
          ) : (
            <button
              onClick={onFollowToggle}
              disabled={followLoading}
              className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 ${
                isFollowing
                  ? "border border-white/20 text-white hover:bg-white/5"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500"
              }`}
            >
              {isFollowing && <Check className="h-4 w-4" />}
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
          <button className="p-2 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Bio ── */}
      {bio && (
        <p className="mt-4 text-sm text-gray-200 leading-relaxed">{bio}</p>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 mt-6 border-y border-white/5 divide-x divide-white/5">
        {stats.map((stat) => (
          <div key={stat.label} className="py-4 text-center">
            <p className="text-white font-bold text-lg leading-tight">
              {stat.value}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-white/5 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? "text-white border-white"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Grid / Empty state ── */}
      {isError && (
        <ErrorBanner onRetry={onRetry} className="mt-8" />
      )}
      
      {isLoading && !isError && (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && !isError && Array.isArray(posts) && posts.length > 0 && (
        <div className="grid grid-cols-3 gap-1 mt-2">
          {posts.map((post, idx) => (
            <Link
              key={`${post.id}-${idx}`}
              href={`/posts/${post.id}`}
              className="aspect-square relative overflow-hidden bg-neutral-900"
            >
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt=""
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 33vw, 220px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://picsum.photos/seed/${post.id}/300/300`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-gray-600 text-xs">
                  No Image
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
      
      {!isLoading && !isError && (!Array.isArray(posts) || posts.length === 0) && (
        <div className="py-8">
          {actionType === "edit" ? (
             <div className="py-20 flex flex-col items-center gap-4 text-center">
               <p className="text-white font-semibold text-base">Your story starts here</p>
               <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                 Share your first post and let the world see your moments, passions,
                 and memories. Make this space truly yours.
               </p>
               <Link href="/create" className="mt-2 px-8 py-3 rounded-full bg-[#7F51F9] text-white text-sm font-semibold hover:bg-[#6B3EE0] transition-colors">
                 Upload My First Post
               </Link>
             </div>
          ) : (
             <EmptyState title={emptyLabel} description=" " />
          )}
        </div>
      )}
    </>
  );
}

/* Helper to export the tab icon components for reuse */
export const ProfileTabIcons = {
  Gallery: <Grid3X3 className="h-4 w-4" />,
  Saved: <Bookmark className="h-4 w-4" />,
  Liked: <Heart className="h-4 w-4" />,
};
