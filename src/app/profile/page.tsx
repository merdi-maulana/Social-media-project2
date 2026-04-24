"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, Bookmark } from "lucide-react";
import { authService, postsService } from "@/services";
import { extractData, extractItems } from "@/lib/apiUtils";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useAuth } from "@/hooks/useRedux";
import { Post, ProfileResponse } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorBanner } from "@/components/shared/EmptyState";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user: authUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push("/login");
  }, [mounted, isAuthenticated, router]);

  // Fetch full profile from API
  const { data: profileData, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: () => authService.getMe(),
    enabled: mounted && isAuthenticated,
  });

  // Fetch my posts
  const { data: postsData, isLoading: postsLoading, isError: postsError, refetch: refetchPosts } = useQuery({
    queryKey: ["me", "posts"],
    queryFn: () => postsService.getMyPosts(1, 20),
    enabled: mounted && isAuthenticated && activeTab === "gallery",
  });

  // Fetch saved posts
  const { data: savedData, isLoading: savedLoading, isError: savedError, refetch: refetchSaved } = useQuery({
    queryKey: ["me", "saved"],
    queryFn: () => postsService.getMySaved(1, 20),
    enabled: mounted && isAuthenticated && activeTab === "saved",
  });

  if (!mounted || !isAuthenticated) return null;

  const profile = (extractData<ProfileResponse>(profileData) || {}) as Partial<ProfileResponse>;
  const displayName =
    profile.name ||
    profile.username ||
    authUser?.name ||
    authUser?.username ||
    "User";
  const username = profile.username || authUser?.username || "";
  const bio = profile.bio || authUser?.bio || "";
  const avatarUrl = profile.avatarUrl || authUser?.avatarUrl;

  const stats = [
    { label: "Post", value: profile?.stats?.posts ?? 0 },
    { label: "Followers", value: profile?.stats?.followers ?? 0 },
    { label: "Following", value: profile?.stats?.following ?? 0 },
    { label: "Likes", value: profile?.stats?.likes ?? 0 },
  ];

  const galleryPosts = extractItems<Post>(postsData);
  const savedPosts = extractItems<Post>(savedData);
  const currentPosts = activeTab === "gallery" ? galleryPosts : savedPosts;
  
  const isLoadingPosts = activeTab === "gallery" ? postsLoading : savedLoading;
  const isErrorPosts = activeTab === "gallery" ? postsError : savedError;
  const handleRetry = activeTab === "gallery" ? refetchPosts : refetchSaved;

  const tabs = [
    { key: "gallery", label: "Gallery", icon: <Grid3X3 className="h-4 w-4" /> },
    { key: "saved", label: "Saved", icon: <Bookmark className="h-4 w-4" /> },
  ];

  if (profileLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (profileError) {
    return <ErrorBanner onRetry={refetchProfile} className="mt-20" />;
  }

  return (
    <main className="max-w-xl mx-auto px-4 pb-24">
        <ProfileCard
          displayName={displayName}
          username={username}
          avatarUrl={avatarUrl}
          bio={bio}
          stats={stats}
          actionType="edit"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          posts={currentPosts}
          emptyLabel={
            activeTab === "gallery" ? "No posts yet" : "No saved posts"
          }
          isLoading={isLoadingPosts}
          isError={isErrorPosts}
          onRetry={handleRetry}
        />
      </main>
  );
}
