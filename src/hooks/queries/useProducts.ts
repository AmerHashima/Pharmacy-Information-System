import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { productService } from "@/api/productService";
import {
  CreateProductUnitDto,
  FilterOperation,
  UpdateProductUnitDto,
} from "@/types";
import { queryKeys } from "./queryKeys";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { handleApiError } from "@/utils/handleApiError";

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

/**
 * Paginated products hook for the Products table.
 */
export function usePaginatedProducts(
  page: number,
  search: string,
  dosageFormId?: string,
) {
  return useQuery({
    queryKey: queryKeys.products.paginated(page, search, dosageFormId),
    queryFn: () => {
      const filters = [];
      if (search.trim()) {
        filters.push({
          propertyName: "drugName",
          value: search,
          operation: FilterOperation.Contains,
        });
      }
      if (dosageFormId) {
        filters.push({
          propertyName: "dosageFormId",
          value: dosageFormId,
          operation: FilterOperation.Equals,
        });
      }

      return productService
        .query({
          request: {
            filters,
            sort: [],
            pagination: { pageNumber: page, pageSize: 10 },
          },
        })
        .then((res) => res.data.data!);
    },
    staleTime: 1000 * 60 * 5, // 5 min
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetch a single product by ID.
 */
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: id
      ? queryKeys.products.detail(id)
      : ["products", "detail", "new"],
    queryFn: () => productService.getById(id!).then((res) => res.data.data!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

/**
 * Fetch product units for a specific product.
 */
export function useProductUnits(productId: string | undefined) {
  return useQuery({
    queryKey: productId ? queryKeys.products.units(productId) : [],
    queryFn: () =>
      productService
        .getProductUnitsByProductId(productId!)
        .then((res) => res.data.data ?? []),
    enabled: !!productId,
  });
}

/**
 * Hook for creating or updating a product unit.
 */
export function useUpsertProductUnit(productId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");

  return useMutation({
    mutationFn: async (data: CreateProductUnitDto | UpdateProductUnitDto) => {
      if ("oid" in data && data.oid) {
        return productService.updateProductUnit(
          data.oid,
          data as UpdateProductUnitDto,
        );
      }
      return productService.createProductUnit(data as CreateProductUnitDto);
    },
    onSuccess: () => {
      toast.success(t("unitSavedSuccessfully"));
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.units(productId),
      });
    },
    onError: (err) => {
      handleApiError(err);
    },
  });
}

/**
 * Hook for deleting a product unit.
 */
export function useDeleteProductUnit(productId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");

  return useMutation({
    mutationFn: (id: string) => productService.deleteProductUnit(id),
    onSuccess: () => {
      toast.success(t("unitDeletedSuccessfully"));
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.units(productId),
      });
    },
    onError: (err) => {
      handleApiError(err);
    },
  });
}
/**
 * Fetch products sharing the same generic name.
 */
export function useAlternativeProducts(
  genericName: string | undefined,
  excludeProductId: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.products.list(`alt-${genericName}`),
    queryFn: () => {
      if (!genericName) return Promise.resolve([]);
      return productService
        .query({
          request: {
            filters: [
              {
                propertyName: "genericName",
                value: genericName,
                operation: FilterOperation.Equals,
              },
            ],
            sort: [],
            pagination: { pageNumber: 1, pageSize: 10 },
          },
        })
        .then((res) => {
          const products = res.data.data?.data ?? [];
          return products.filter((p) => p.oid !== excludeProductId);
        });
    },
    enabled: !!genericName,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
