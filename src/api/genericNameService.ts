import api from "./axios";
import {
  ApiResponse,
  GenericNameDto,
  CreateGenericNameDto,
  UpdateGenericNameDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const genericNameService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<GenericNameDto>>>(
      "/api/GenericName/query",
      req,
    ),

  getAll: () => api.get<ApiResponse<GenericNameDto[]>>("/api/GenericName"),

  search: (term: string) =>
    api.get<ApiResponse<GenericNameDto[]>>("/api/GenericName/search", {
      params: { term },
    }),

  getById: (id: string) =>
    api.get<ApiResponse<GenericNameDto>>(`/api/GenericName/${id}`),

  create: (dto: CreateGenericNameDto) =>
    api.post<ApiResponse<GenericNameDto>>("/api/GenericName", dto),

  update: (id: string, dto: UpdateGenericNameDto) =>
    api.put<ApiResponse<GenericNameDto>>(`/api/GenericName/${id}`, dto),

  delete: (id: string) => api.delete<ApiResponse>(`/api/GenericName/${id}`),
};
