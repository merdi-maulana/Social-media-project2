"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/hooks/useRedux";
import homeicon from "@/assets/svg/Home.svg";
import profileicon from "@/assets/svg/profile.svg";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleProtected = (e: React.MouseEvent, href: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/login");
    }
  };

  return (
    <nav className="fixed bottom-5 md:max-w-md md:mx-auto rounded-full mx-5 inset-x-0 z-50 bg-neutral-900/95 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-xl mx-auto flex items-center justify-around h-16 px-6">
        {/* Home */}
        <Link
          href="/feed"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            pathname === "/feed"
              ? "text-[#7F51F9]"
              : "text-[#FDFDFD] hover:text-[#7F51F9]",
          )}
        >
          <Image
            src={homeicon}
            alt="Home"
            width={24}
            height={24}
            style={{
              filter:
                pathname === "/feed"
                  ? "brightness(0) saturate(100%) invert(33%) sepia(95%) saturate(3685%) hue-rotate(247deg) brightness(101%) contrast(95%)"
                  : "brightness(0) saturate(100%) invert(99%) sepia(1%) saturate(200%) hue-rotate(253deg) brightness(115%) contrast(98%)",
            }}
          />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Create (center fab) — guarded */}
        <Link
          href="/create"
          onClick={(e) => handleProtected(e, "/create")}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-6 w-6 text-white" />
        </Link>

        {/* Profile — guarded */}
        <Link
          href="/profile"
          onClick={(e) => handleProtected(e, "/profile")}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            pathname.startsWith("/profile")
              ? "text-[#7F51F9]"
              : "text-[#FDFDFD] hover:text-[#7F51F9]",
          )}
        >
          <Image
            src={profileicon}
            alt="Profile"
            width={24}
            height={24}
            style={{
              filter: pathname.startsWith("/profile")
                ? "brightness(0) saturate(100%) invert(33%) sepia(95%) saturate(3685%) hue-rotate(247deg) brightness(101%) contrast(95%)"
                : "brightness(0) saturate(100%) invert(99%) sepia(1%) saturate(200%) hue-rotate(253deg) brightness(115%) contrast(98%)",
            }}
          />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
