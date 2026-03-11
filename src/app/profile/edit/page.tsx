"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { usersService, authService } from "@/services";
import { extractData, extractErrorMessage } from "@/lib/apiUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, useAppDispatch } from "@/hooks/useRedux";
import { updateUser } from "@/store/authSlices";
import { AuthUser } from "@/types";

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push("/login");
  }, [mounted, isAuthenticated, router]);

  // Pre-fill form from auth user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => authService.updateMe({ bio: formData.get("bio") as string }),
    onSuccess: (res) => {
      // Update redux state with new profile data
      const updated = extractData<AuthUser>(res) || (res as unknown as AuthUser);
      dispatch(
        updateUser({
          name: updated.name ?? name,
          username: updated.username ?? username,
          phone: updated.phone ?? phone,
          bio: updated.bio ?? bio,
          avatarUrl: updated.avatarUrl ?? avatarPreview ?? undefined,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/profile");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("phone", phone);
    formData.append("bio", bio);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    mutation.mutate(formData);
  };

  if (!mounted || !isAuthenticated) return null;

  const displayName = name || username || "User";

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
            <span className="text-white text-lg font-bold">Edit Profile</span>
          </div>
          {avatarPreview ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px]">
              <img
                src={avatarPreview}
                alt={username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {displayName[0].toUpperCase()}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-12">
        {/* Avatar section */}
        <div className="flex flex-col items-center pt-8">
          <Avatar className="h-24 w-24 ring-2 ring-white/10">
            <AvatarImage src={avatarPreview || undefined} alt={displayName} />
            <AvatarFallback className="text-2xl">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 px-6 py-2 rounded-full bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition-colors border border-white/10"
          >
            Change Photo
          </button>
        </div>

        {/* Form */}
        <div className="mt-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-neutral-900/50 border border-white/5 rounded-xl px-4 py-3 text-gray-400 text-sm outline-none cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Number Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full mt-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>

        {/* Error message */}
        {mutation.isError && (
          <p className="mt-3 text-center text-red-400 text-sm">
            {extractErrorMessage(mutation.error)}
          </p>
        )}
      </main>
    </>
  );
}
