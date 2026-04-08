import api from "./axios";
import {
  ApiResponse,
  StoreDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const storeService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<StoreDto>>>("/api/Store/query", req),

  getByBranchId: (branchId: string) => 
    api.get<ApiResponse<StoreDto[]>>(`/api/Store/by-branch/${branchId}`),

  getById: (id: string) => 
    api.get<ApiResponse<StoreDto>>(`/api/Store/${id}`),
};
