"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useRedux";
import { Search, Menu, X, User, PlusSquare, LogOut } from "lucide-react";
import logo from "@/assets/svg/Logo.svg";
import { SearchOverlay } from "./SearchOverlay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usersService } from "@/services";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SearchUser {
  id: number | string;
  username: string;
  name?: string;
  avatarUrl?: string;
}

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Desktop inline search state
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  // Focus input when desktop search opens
  useEffect(() => {
    if (desktopSearchOpen) {
      desktopInputRef.current?.focus();
    }
  }, [desktopSearchOpen]);

  // Close desktop search on click outside
  useEffect(() => {
    if (!desktopSearchOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setDesktopSearchOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [desktopSearchOpen]);

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

  const handleDesktopSelect = (username: string) => {
    setDesktopSearchOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/profile/${username}`);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="md:mx-20 mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={isAuthenticated ? "/feed" : "/"}
            className="flex items-center gap-2"
          >
            <Image src={logo} alt="Logo" width={22} height={22} />
            <span className="text-white text-lg font-bold tracking-tight">
              Sociality
            </span>
          </Link>

          {/* Desktop inline search */}
          <div ref={desktopSearchRef} className="hidden md:block relative">
            {!desktopSearchOpen ? (
              <button
                onClick={() => setDesktopSearchOpen(true)}
                className="flex items-center gap-3 py-2 px-4 rounded-full bg-neutral-950 border border-neutral-900 w-[491px] text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span className="text-gray-500 text-sm">Search</span>
              </button>
            ) : (
              <div className="w-[491px]">
                <div className="flex items-center gap-2 bg-neutral-800 rounded-full px-4 py-2">
                  <Search className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    ref={desktopInputRef}
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
                  <button
                    onClick={() => {
                      setDesktopSearchOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                    className="text-gray-400 hover:text-white ml-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Dropdown results */}
                {(loading || results.length > 0 || query.trim()) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                    {loading && (
                      <div className="flex justify-center py-6">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {!loading && results.length === 0 && query.trim() && (
                      <div className="flex justify-center flex-col py-6 align-center">
                        <h2 className="text-white text-center text-sm font-semibold">
                          No result found
                        </h2>
                        <p className="text-center text-gray-500 py-2 text-sm">
                          change your keyword
                        </p>
                      </div>
                    )}

                    {results.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleDesktopSelect(u.username)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <Avatar className="h-9 w-9 ring-2 ring-white/10">
                          <AvatarImage
                            src={u.avatarUrl}
                            alt={u.name || u.username}
                          />
                          <AvatarFallback className="text-xs bg-neutral-800 text-white">
                            {(u.name || u.username || "U")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm font-semibold">
                            {u.name || u.username}
                          </p>
                          <p className="text-gray-500 text-xs">@{u.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="text-gray-400 md:hidden hover:text-white transition-colors p-1.5"
            >
              <Search className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              /* Logged-in: avatar with dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 flex items-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-1 focus:ring-offset-black">
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={user?.avatarUrl}
                        alt={user?.username || "User"}
                      />
                      <AvatarFallback className="text-xs bg-neutral-800 text-white">
                        {(user?.name || user?.username || "U")[0].toUpperCase()}
                      </AvatarFallback>
                      <h2 className="ml-4 font-bold hidden md:block">
                        {user?.name}
                      </h2>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-neutral-900 border border-white/10 text-white"
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="gap-2 cursor-pointer focus:bg-white/10"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/create")}
                    className="gap-2 cursor-pointer focus:bg-white/10"
                  >
                    <PlusSquare className="h-4 w-4" />
                    Create Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Not logged-in: show hamburger */
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="text-gray-400 hover:text-white transition-colors p-1.5"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Guest dropdown menu */}
        {!isAuthenticated && menuOpen && (
          <div className="max-w-xl mx-auto px-4 pb-4 flex items-center gap-3">
            <Link
              href="/login"
              className="flex-1 text-center py-2.5 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </header>

      {mobileSearchOpen && (
        <SearchOverlay onClose={() => setMobileSearchOpen(false)} />
      )}
    </>
  );
}
