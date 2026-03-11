"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, ArrowUpFromLine, Trash2 } from "lucide-react";
import { postsService } from "@/services";
import { extractErrorMessage } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useRedux";

export default function CreatePostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [errors, setErrors] = useState<{ image?: string; caption?: string }>(
    {},
  );
  const [toast, setToast] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push("/login");
  }, [mounted, isAuthenticated, router]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
      setErrors((e) => ({
        ...e,
        image: "Only PNG, JPG, or WEBP files are allowed",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "File must be under 5MB" }));
      return;
    }
    setErrors((e) => ({ ...e, image: undefined }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const mutation = useMutation({
    mutationFn: (formData: FormData) => postsService.createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["me", "posts"] });
      setToast("Success Post");
      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      // Navigate to feed after a brief delay so user sees the toast
      setTimeout(() => router.push("/feed"), 1500);
    },
  });

  const validate = (): boolean => {
    const newErrors: { image?: string; caption?: string } = {};
    if (!imageFile) newErrors.image = "Please select an image";
    if (!caption.trim()) newErrors.caption = "Please add a caption";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (mutation.isPending) return;
    const formData = new FormData();
    formData.append("image", imageFile!);
    formData.append("caption", caption.trim());
    mutation.mutate(formData);
  };

  if (!mounted || !isAuthenticated) return null;

  const displayName = user?.name || user?.username || "User";

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-green-600 text-white text-sm font-medium shadow-lg shadow-green-500/30 flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          {toast}
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

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
            <span className="text-white text-lg font-bold">Add Post</span>
          </div>
          {user?.avatarUrl ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px]">
              <img
                src={user.avatarUrl}
                alt={user.username}
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
        {/* Photo section */}
        <div className="mt-6">
          <label className="block text-white text-sm font-semibold mb-3">
            Photo
          </label>

          {imagePreview ? (
            /* Image preview */
            <div className="rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
              <div className="relative aspect-square">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 p-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition-colors border border-white/10"
                >
                  <ArrowUpFromLine className="h-4 w-4" />
                  Change Image
                </button>
                <button
                  onClick={removeImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors border border-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Image
                </button>
              </div>
            </div>
          ) : (
            /* Upload area */
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 py-12 rounded-xl cursor-pointer transition-all border ${
                errors.image
                  ? "border-red-500 border-dashed bg-red-500/5"
                  : dragging
                    ? "border-purple-500 border-dashed bg-purple-500/5"
                    : "border-white/10 border-dashed bg-neutral-900 hover:bg-neutral-800 hover:border-white/20"
              }`}
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-400">
                <span className="text-purple-400 font-semibold">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG or JPG (max. 5mb)</p>
            </div>
          )}

          {errors.image && (
            <p className="mt-2 text-red-400 text-xs">{errors.image}</p>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Caption section */}
        <div className="mt-6">
          <label className="block text-white text-sm font-semibold mb-3">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              if (errors.caption)
                setErrors((prev) => ({ ...prev, caption: undefined }));
            }}
            placeholder="Create your caption"
            rows={5}
            className={`w-full bg-neutral-900 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none transition-colors border ${
              errors.caption
                ? "border-red-500 focus:border-red-500"
                : "border-white/10 focus:border-purple-500"
            }`}
          />
          {errors.caption && (
            <p className="mt-2 text-red-400 text-xs">{errors.caption}</p>
          )}
        </div>

        {/* Share button */}
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full mt-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {mutation.isPending ? "Sharing..." : "Share"}
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
