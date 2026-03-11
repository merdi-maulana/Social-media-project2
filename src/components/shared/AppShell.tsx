"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/feed/Navbar";
import { BottomNav } from "@/components/feed/BottomNav";

const NO_SHELL_ROUTES = ["/login", "/register", "/create", "/profile/edit", "/"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isNoShell = NO_SHELL_ROUTES.includes(pathname || "");
  const isProfileDetail =
    pathname?.startsWith("/profile/") &&
    pathname !== "/profile/edit" &&
    pathname !== "/profile";

  if (isNoShell) {
    return <>{children}</>;
  }

  if (isProfileDetail) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
