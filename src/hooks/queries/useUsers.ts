import { useQuery } from "@tanstack/react-query";
import { systemUserService } from "@/api/systemUserService";
import { FilterOperation } from "@/types";
import { queryKeys } from "./queryKeys";

const PAGE_SIZE = 10;

/**
 * Paginated users hook for the Users table.
 */
export function usePaginatedUsers(page: number, search: string) {
  return useQuery({
    queryKey: queryKeys.users.list(page, search),
    queryFn: () =>
      systemUserService
        .query({
          request: {
            filters: search.trim()
              ? [
                  {
                    propertyName: "fullName",
                    value: search,
                    operation: FilterOperation.Contains,
                  },
                ]
              : [],
            sort: [],
            pagination: { pageNumber: page, pageSize: PAGE_SIZE },
          },
        })
        .then((res) => res.data.data!),
    staleTime: 1000 * 60 * 5, // 5 min
    placeholderData: (prev) => prev,
  });
}
