import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/** Merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a human-readable relative time string using dayjs.
 * Example: "2 hours ago", "3 days ago"
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  return dayjs(dateStr).fromNow();
}
