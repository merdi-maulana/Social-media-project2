"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { extractData } from "@/lib/apiUtils";
import { ErrorBanner } from "@/components/shared/EmptyState";
import { useAuth } from "@/hooks/useRedux";
import type { Post } from "@/types";
import { usePostDetail } from "./hook";
import { PostCard } from "@/components/post/PostCard";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
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
    <main className="max-w-2xl mx-auto pb-24 px-4 pt-4">
      <PostCard post={post} queryKey={["post", postId]} />
    </main>
  );
}
