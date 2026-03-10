import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { branchService } from "@/api/branchService";
import { FilterOperation, FilterRequest } from "@/types";
import { queryKeys } from "./queryKeys";

const PAGE_SIZE = 20;

/**
 * Full unpaginated branch list — for simple static dropdowns.
 * Long staleTime since branch list rarely changes.
 */
export function useBranches() {
  return useQuery({
    queryKey: queryKeys.branches.allList(),
    queryFn: () => branchService.getAll().then((res) => res.data.data ?? []),
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

/**
 * Infinite-scroll paginated branches hook (for the Select with search).
 * Shares the same key factory so the empty-search result is cached
 * and reused across all pages that show a branch Select.
 */
export function useInfiniteBranches(search: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.branches.list(search),
    queryFn: ({ pageParam = 1 }) =>
      branchService
        .query({
          request: {
            filters: search.trim()
              ? [
                  new FilterRequest(
                    "branchName",
                    search,
                    FilterOperation.Contains,
                  ),
                ]
              : [],
            sort: [{ sortBy: "branchName", sortDirection: "asc" }],
            pagination: {
              pageNumber: pageParam as number,
              pageSize: PAGE_SIZE,
            },
          },
        })
        .then((res) => res.data.data!),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,

    staleTime: 1000 * 60 * 5, // 5 min
    placeholderData: (prev) => prev,
  });
}
