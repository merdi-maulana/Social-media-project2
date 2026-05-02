import { useInfiniteQuery } from "@tanstack/react-query";
import { extractPagination } from "@/lib/apiUtils";
import { feedApi } from "./api";

export const useInfinitePosts = (isEnabled: boolean) => {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => feedApi.getPosts(pageParam as number, 20),
    getNextPageParam: (lastPage) => {
      const pagination = extractPagination(lastPage);
      if (!pagination) return undefined;
      return pagination.currentPage < pagination.totalPages
        ? pagination.currentPage + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: isEnabled,
  });
};