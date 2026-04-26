import { useInfiniteQuery } from "@tanstack/react-query";
import { postsService } from "@/services";
import { extractPagination } from "@/lib/apiUtils";

export const useInfinitePosts = (isEnabled: boolean) => {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({pageParam = 1}) => postsService.getPosts(pageParam as number, 20),
    getNextPageParam: (lastPage) => {
      const pagination = extractPagination(lastPage);
      if (!pagination) return undefined;
      return pagination.currentPage < pagination.totalPages ? pagination.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isEnabled,
  })
}