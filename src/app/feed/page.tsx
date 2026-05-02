"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { extractItems } from "@/lib/apiUtils";
import { PostCard } from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/shared/LoadingSpinner";
import { EmptyState, ErrorBanner } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Post } from "@/types";
import { useAuth } from "@/hooks/useRedux";
import { useRouter, usePathname } from "next/navigation";
import { useInfinitePosts } from "./hook";

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfinitePosts(mounted && isAuthenticated);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Redirect to login once mounted and confirmed not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, isAuthenticated, router, pathname]);

  // Intersection observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // API shape: { success, message, data: { posts: [...], pagination: {...} } }
  const posts: Post[] = data?.pages.flatMap((p) => extractItems<Post>(p)) ?? [];

  // Show nothing until mounted to match server render
  if (!mounted) return null;
  if (!isAuthenticated) return null;
  return (
    <main className="max-w-xl mx-auto pb-24 px-4">
      {/* Loading skeletons */}
      {isLoading && (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && <ErrorBanner onRetry={() => refetch()} />}

      {/* Empty state */}
      {!isLoading && !isError && posts.length === 0 && (
        <EmptyState type="feed" />
      )}

      {/* Posts list */}
      <div className="divide-y divide-white/5">
        {posts.map((post, idx) => {
          const isLast = idx === posts.length - 1;
          return (
            <div key={`${post.id}-${idx}`} ref={isLast ? lastRef : undefined}>
              <PostCard post={post} queryKey={["posts"]} />
            </div>
          );
        })}
      </div>

      {/* Bottom loader */}
      <div ref={bottomRef} className="py-4 flex justify-center">
        {isFetchingNextPage && <LoadingSpinner size="sm" />}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-xs text-gray-600">You&apos;re all caught up 🎉</p>
        )}
      </div>
    </main>
  );
}
