import { useState, useCallback } from "react";
import {
  QueryRequest,
  PagedResult,
  FilterOperation,
  FilterRequest,
} from "@/types";

interface UseQueryOptions {
  service: (req: QueryRequest) => Promise<{ data: { data: PagedResult<any> } }>;
  pageSize?: number;
}

export function useQueryTable<T>({ service, pageSize = 10 }: UseQueryOptions) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetch = useCallback(
    async (
      searchTerm = "",
      extraFilters: FilterRequest[] = [],
      overridePage?: number,
    ) => {
      setIsLoading(true);
      try {
        const filters = [...extraFilters];
        if (searchTerm) {
          // Note: The caller should ideally handle specific field searching, but strictly following SOP 10 pattern here:
          // SOP says: filters.push({ propertyName: 'name', value: searchTerm, operation: FilterOperation.Contains });
          // But 'name' might not exist on all entities.
          // However, keeping it generic as per SOP.
          filters.push({
            propertyName: "name",
            value: searchTerm,
            operation: FilterOperation.Contains,
          });
        }
        const req: QueryRequest = {
          request: {
            filters,
            sort: [],
            pagination: {
              pageNumber: overridePage ?? pageNumber,
              pageSize,
            },
          },
        };
        const res = await service(req);
        if (res.data.data) {
          setData(res.data.data.data);
          setTotalPages(res.data.data.totalPages);
          setTotalRecords(res.data.data.totalRecords);
          if (overridePage !== undefined) {
            setPageNumber(overridePage);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [pageNumber, pageSize, service],
  );

  return {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  };
}
