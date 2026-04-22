import { useQuery } from "@tanstack/react-query";
import { genericNameService } from "@/api/genericNameService";
import { queryKeys } from "./queryKeys";

export function useGenericNames() {
  return useQuery({
    queryKey: queryKeys.genericNames.allList(),
    queryFn: async () => {
      const { data } = await genericNameService.getAll();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
