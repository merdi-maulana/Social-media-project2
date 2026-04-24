"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Grid3X3, Heart } from "lucide-react";
import { usersService, postsService } from "@/services";
import { extractData, extractItems } from "@/lib/apiUtils";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useAuth } from "@/hooks/useRedux";
import { Post, ProfileResponse } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorBanner } from "@/components/shared/EmptyState";

export default function FriendProfilePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: authUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");

  const targetUsername = params.username as string;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push("/login");
  }, [mounted, isAuthenticated, router]);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (mounted && authUser?.username && targetUsername === authUser.username) {
      router.replace("/profile");
    }
  }, [mounted, authUser, targetUsername, router]);

  // Fetch public profile
  const { data: profileData, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ["user", targetUsername, "profile"],
    queryFn: () => usersService.getProfile(targetUsername),
    enabled: mounted && isAuthenticated && !!targetUsername,
  });

  // Fetch user's posts
  const { data: postsData, isLoading: postsLoading, isError: postsError, refetch: refetchPosts } = useQuery({
    queryKey: ["user", targetUsername, "posts"],
    queryFn: () => postsService.getUserPosts(targetUsername, 1, 20),
    enabled: mounted && isAuthenticated && activeTab === "gallery",
  });

  // Fetch user's liked posts
  const { data: likedData, isLoading: likedLoading, isError: likedError, refetch: refetchLiked } = useQuery({
    queryKey: ["user", targetUsername, "likes"],
    queryFn: () => postsService.getUserLikes(targetUsername, 1, 20),
    enabled: mounted && isAuthenticated && activeTab === "liked",
  });

  const profile = (extractData<ProfileResponse>(profileData) || {}) as Partial<ProfileResponse>;
  const isFollowing = profile.isFollowing ?? false;

  // Follow / Unfollow mutation
  const followMutation = useMutation({
    mutationFn: () =>
      isFollowing
        ? usersService.unfollow(targetUsername)
        : usersService.follow(targetUsername),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", targetUsername, "profile"],
      });
      queryClient.invalidateQueries({ queryKey: ["me", "following"] });
      queryClient.invalidateQueries({ queryKey: ["me", "profile"] });
    },
  });

  if (!mounted || !isAuthenticated) return null;

  const displayName = profile.name || profile.username || targetUsername;
  const username = profile.username || targetUsername;
  const bio = profile.bio || "";
  const avatarUrl = profile.avatarUrl;

  const galleryPosts = extractItems<Post>(postsData);
  const likedPosts = extractItems<Post>(likedData);
  const currentPosts = activeTab === "gallery" ? galleryPosts : likedPosts;

  const isLoadingPosts = activeTab === "gallery" ? postsLoading : likedLoading;
  const isErrorPosts = activeTab === "gallery" ? postsError : likedError;
  const handleRetry = activeTab === "gallery" ? refetchPosts : refetchLiked;

  const tabs = [
    { key: "gallery", label: "Gallery", icon: <Grid3X3 className="h-4 w-4" /> },
    { key: "liked", label: "Liked", icon: <Heart className="h-4 w-4" /> },
  ];

  const stats = [
    { label: "Post", value: profile.counts?.post ?? 0 },
    { label: "Followers", value: profile.counts?.followers ?? 0 },
    { label: "Following", value: profile.counts?.following ?? 0 },
    { label: "Likes", value: profile.counts?.likes ?? 0 },
  ];

  if (profileLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (profileError) {
    return <ErrorBanner onRetry={refetchProfile} className="mt-20" />;
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-white text-lg font-bold">{displayName}</span>
          </div>
          {avatarUrl ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px]">
              <img
                src={avatarUrl}
                alt={username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {displayName[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-24">
        <ProfileCard
          displayName={displayName}
          username={username}
          avatarUrl={avatarUrl}
          bio={bio}
          stats={stats}
          actionType="follow"
          isFollowing={isFollowing}
          onFollowToggle={() => followMutation.mutate()}
          followLoading={followMutation.isPending}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          posts={currentPosts}
          emptyLabel={
            activeTab === "gallery" ? "No posts yet" : "No liked posts"
          }
          isLoading={isLoadingPosts}
          isError={isErrorPosts}
          onRetry={handleRetry}
        />
      </main>
    </>
  );
}
