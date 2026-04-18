import api from "./axios";
import {
  ApiResponse,
  BranchDto,
  CreateBranchDto,
  UpdateBranchDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const branchService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<BranchDto>>>("/api/Branch/query", req),

  getAll: () => api.get<ApiResponse<BranchDto[]>>("/api/Branch"),

  getById: (id: string) => api.get<ApiResponse<BranchDto>>(`/api/Branch/${id}`),

  create: (dto: CreateBranchDto) =>
    api.post<ApiResponse<BranchDto>>("/api/Branch", dto),

  update: (id: string, dto: UpdateBranchDto) =>
    api.put<ApiResponse<BranchDto>>(`/api/Branch/${id}`, dto),

  delete: (id: string) => api.delete<ApiResponse>(`/api/Branch/${id}`),

  uploadLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<ApiResponse>(`/api/Branch/${id}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  deleteLogo: (id: string) =>
    api.delete<ApiResponse>(`/api/Branch/${id}/logo`).then((res) => res.data),
};
