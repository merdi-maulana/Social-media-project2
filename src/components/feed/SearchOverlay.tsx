"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { usersService } from "@/services";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SearchUser {
  id: number | string;
  username: string;
  name?: string;
  avatarUrl?: string;
}

interface SearchOverlayProps {
  onClose: () => void;
}

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await usersService.searchUsers(query.trim());
        // API shape: { data: { users: [...] } } or { data: [...] }
        const users = res?.data?.users ?? res?.data ?? res?.users ?? [];
        setResults(Array.isArray(users) ? users : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (username: string) => {
    onClose();
    router.push(`/profile/${username}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Search header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div className="flex-1 flex items-center gap-2 bg-neutral-800 rounded-full px-4 py-2.5">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 md:flex-none overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length === 0 && query.trim() && (
          <p className="text-center text-gray-500 py-8 text-sm">
            No users found
          </p>
        )}

        {results.map((user) => (
          <button
            key={user.id}
            onClick={() => handleSelect(user.username)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
          >
            <Avatar className="h-11 w-11 ring-2 ring-white/10">
              <AvatarImage
                src={user.avatarUrl}
                alt={user.name || user.username}
              />
              <AvatarFallback>
                {(user.name || user.username || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-semibold">
                {user.name || user.username}
              </p>
              <p className="text-gray-500 text-xs">@{user.username}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
