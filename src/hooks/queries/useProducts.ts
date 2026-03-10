import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { productService } from "@/api/productService";
import { FilterOperation } from "@/types";
import { queryKeys } from "./queryKeys";

const PAGE_SIZE = 20;

/**
 * Infinite-scroll paginated products hook.
 *
 * Returns pages progressively; each page is fetched only when
 * `fetchNextPage()` is called (typically by the Select sentinel).
 *
 * The query key includes `search` so different search terms get
 * their own independently cached page sequences.
 */
export function useInfiniteProducts(search: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(search),
    queryFn: ({ pageParam = 1 }) =>
      productService
        .query({
          request: {
            pagination: {
              pageNumber: pageParam as number,
              pageSize: PAGE_SIZE,
            },
            filters: search.trim()
              ? [
                  {
                    propertyName: "drugName",
                    value: search,
                    operation: FilterOperation.Contains,
                  },
                ]
              : [],
          },
        })
        .then((res) => res.data.data!),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,

    // Keep stale results visible while re-fetching so the dropdown never
    // shows an empty list while the user is actively selecting.
    staleTime: 1000 * 60 * 2, // 2 min
    placeholderData: (prev) => prev,
  });
}

/**
 * Simple debounced name-search for products (used in SaleForm typeahead).
 * Returns only the first page — no infinite scroll needed here.
 */
export function useProductSearch(search: string) {
  return useQuery({
    queryKey: queryKeys.products.list(search),
    queryFn: () =>
      productService
        .query({
          request: {
            filters: search.trim()
              ? [
                  {
                    propertyName: "drugName",
                    value: search,
                    operation: FilterOperation.Contains,
                  },
                ]
              : [],
            sort: [],
            pagination: { pageNumber: 1, pageSize: 10 },
          },
        })
        .then((res) => res.data.data?.data ?? []),
    enabled: !!search.trim(),
    staleTime: 1000 * 30, // 30 s — short, search results change often
    placeholderData: (prev) => prev,
  });
}
