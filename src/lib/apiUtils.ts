import { ApiResponse, PaginatedResponse } from "@/types";

interface FlexibleResponse {
  data?: {
    items?: unknown[];
    posts?: unknown[];
    data?: unknown;
    pagination?: Record<string, unknown>;
    meta?: Record<string, unknown>;
  } | unknown[] | unknown;
  items?: unknown[];
  posts?: unknown[];
  pagination?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * Extracts a typed array from a combined/messy API response.
 * Handles variations like `data.items`, `data.posts`, `data`, etc.
 */
export function extractItems<T>(
  response: PaginatedResponse<T> | ApiResponse<T[]> | { items?: T[]; posts?: T[]; data?: T[] | { items?: T[]; posts?: T[] } } | unknown
): T[] {
  if (!response) return [];

  const res = response as FlexibleResponse;
  
  // Drill down to the array
  const arr =
    (res?.data as FlexibleResponse)?.items ??
    (res?.data as FlexibleResponse)?.posts ??
    res?.items ??
    res?.posts ??
    res?.data ??
    [];

  return Array.isArray(arr) ? arr : [];
}

/**
 * Extracts a single typed object from an API response.
 * Handles `data.data`, `data`, etc.
 */
export function extractData<T>(
  response: ApiResponse<T> | { data?: T } | unknown
): T | null {
  if (!response) return null;

  const res = response as FlexibleResponse;
  return ((res?.data as FlexibleResponse)?.data ?? res?.data ?? res ?? null) as T | null;
}

/**
 * Extracts backend pagination metadata safely.
 */
export function extractPagination(lastPage: unknown): { currentPage: number; totalPages: number } | null {
  const lp = lastPage as FlexibleResponse;
  const pagination = (lp?.data as FlexibleResponse)?.pagination ?? lp?.pagination ?? lp?.meta ?? null;
  
  if (!pagination || typeof pagination !== "object") return null;
  
  const page = (pagination as Record<string, unknown>).page ?? (pagination as Record<string, unknown>).currentPage ?? 1;
  const total = (pagination as Record<string, unknown>).total as number | undefined;
  const limit = (pagination as Record<string, unknown>).limit as number | undefined;
  
  const currentPage = typeof page === "number" ? page : 1;
  const totalPages =
    (pagination as Record<string, unknown>).totalPages as number ??
    (total
      ? Math.ceil(total / (limit ?? 10))
      : 1);

  return { currentPage, totalPages };
}

/**
 * Extracts error messages safely from Axios or standard Error objects.
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred.";
  const err = error as FlexibleResponse;
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong. Please try again."
  );
}
