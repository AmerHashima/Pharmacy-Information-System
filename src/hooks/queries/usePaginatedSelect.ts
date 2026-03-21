import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/api/productService";
import { branchService } from "@/api/branchService";
import { stakeholderService } from "@/api/stakeholderService";
import {
  FilterOperation,
  FilterRequest,
  ProductDto,
  BranchDto,
  StakeholderDto,
} from "@/types";
import { queryKeys } from "./queryKeys";

const PRODUCT_PAGE_SIZE = 20;
const BRANCH_PAGE_SIZE = 20;

// ─── Products ─────────────────────────────────────────────────────────────────

interface UsePaginatedProductsOptions {
  /**
   * IDs that must always appear in the list (e.g. currently selected items).
   * The hook keeps them even when a new search replaces the visible page.
   */
  preserveIds?: string[];
}

/**
 * Wraps `useInfiniteQuery` for products and exposes a flat, deduplicated
 * `options` array that the `<Select>` component can consume directly.
 *
 * - `search` drives the query key; changing it resets to page 1 automatically.
 * - `preserveIds` ensures selected products are never evicted from the list.
 * - Returns `loadMore / hasMore / isLoadingMore` ready to pass to `<Select>`.
 */
export function usePaginatedProducts({
  preserveIds = [],
}: UsePaginatedProductsOptions = {}) {
  const [search, setSearchState] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const query = useInfiniteQuery({
    queryKey: queryKeys.products.list(search),
    queryFn: ({ pageParam = 1 }) =>
      productService
        .query({
          request: {
            pagination: {
              pageNumber: pageParam as number,
              pageSize: PRODUCT_PAGE_SIZE,
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
    staleTime: 1000 * 60 * 2, // 2 min — enough to avoid re-fetching between tab switches
    placeholderData: (prev) => prev,
  });

  // Flat, deduplicated list across all loaded pages
  const [options, setOptions] = useState<ProductDto[]>([]);
  const preserveIdsRef = useRef(preserveIds);
  preserveIdsRef.current = preserveIds;

  useEffect(() => {
    if (!query.data) return;
    const fetched = query.data.pages.flatMap((p) => p.data);
    setOptions((prev) => {
      // Keep selected products that aren't in the new page set
      const preserved = prev.filter(
        (p) =>
          preserveIdsRef.current.includes(p.oid) &&
          !fetched.find((f) => f.oid === p.oid),
      );
      // Deduplicate fetched + preserved
      const merged = [...fetched];
      preserved.forEach((p) => {
        if (!merged.find((m) => m.oid === p.oid)) merged.push(p);
      });
      return merged;
    });
  }, [query.data]);

  /** Debounced — call this from the Select's `onSearchChange` */
  const setSearch = (value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setSearchState(value), 300);
  };

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  };

  return {
    options,
    setOptions,
    search,
    setSearch,
    loadMore,
    hasMore: query.hasNextPage ?? false,
    isLoadingMore: query.isFetchingNextPage || query.isLoading,
  };
}

// ─── Branches ─────────────────────────────────────────────────────────────────

/**
 * Infinite-scroll paginated branches hook for the branch `<Select>`.
 * Same pattern as `usePaginatedProducts` but for branches.
 */
export function usePaginatedBranches() {
  const [search, setSearchState] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const query = useInfiniteQuery({
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
              pageSize: BRANCH_PAGE_SIZE,
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

  const [options, setOptions] = useState<BranchDto[]>([]);

  useEffect(() => {
    if (!query.data) return;
    const fetched = query.data.pages.flatMap((p) => p.data);
    setOptions((prev) => {
      const merged = [...fetched];
      // Append any previous pages not yet replaced (load-more case)
      prev.forEach((p) => {
        if (!merged.find((m) => m.oid === p.oid)) merged.push(p);
      });
      return merged;
    });
  }, [query.data]);

  const setSearch = (value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setOptions([]); // clear immediately on new search for clean UX
      setSearchState(value);
    }, 300);
  };

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  };

  return {
    options,
    search,
    setSearch,
    loadMore,
    hasMore: query.hasNextPage ?? false,
    isLoadingMore: query.isFetchingNextPage || query.isLoading,
  };
}

// ─── Suppliers (Vendors) ──────────────────────────────────────────────────────

const SUPPLIER_PAGE_SIZE = 20;

/**
 * Infinite-scroll paginated suppliers hook for the supplier `<Select>`.
 * Same pattern as `usePaginatedBranches` but for vendors/suppliers.
 */
export function usePaginatedSuppliers() {
  const [search, setSearchState] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const query = useInfiniteQuery({
    queryKey: queryKeys.stakeholders.vendorList(search),
    queryFn: ({ pageParam = 1 }) => {
      const filters: FilterRequest[] = [
        new FilterRequest(
          "StakeholderTypeCode",
          "VENDOR",
          FilterOperation.Equals,
        ),
      ];
      if (search.trim()) {
        filters.push(
          new FilterRequest("name", search, FilterOperation.Contains),
        );
      }
      return stakeholderService
        .query({
          request: {
            filters,
            sort: [{ sortBy: "name", sortDirection: "asc" }],
            pagination: {
              pageNumber: pageParam as number,
              pageSize: SUPPLIER_PAGE_SIZE,
            },
          },
        })
        .then((res) => res.data.data!);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 min
    placeholderData: (prev) => prev,
  });

  const [options, setOptions] = useState<StakeholderDto[]>([]);

  useEffect(() => {
    if (!query.data) return;
    const fetched = query.data.pages.flatMap((p) => p.data);
    setOptions((prev) => {
      const merged = [...fetched];
      prev.forEach((p) => {
        if (!merged.find((m) => m.oid === p.oid)) merged.push(p);
      });
      return merged;
    });
  }, [query.data]);

  const setSearch = (value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setOptions([]); // clear immediately on new search for clean UX
      setSearchState(value);
    }, 300);
  };

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  };

  return {
    options,
    search,
    setSearch,
    loadMore,
    hasMore: query.hasNextPage ?? false,
    isLoadingMore: query.isFetchingNextPage || query.isLoading,
  };
}
