import api from "./axios";
import {
  ApiResponse,
  InvoiceShapeDto,
  CreateInvoiceShapeDto,
  UpdateInvoiceShapeDto,
  PagedResult,
  QueryRequest,
  BooleanApiResponse,
} from "@/types";

export const invoiceShapeService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<InvoiceShapeDto>>>(
      "/api/InvoiceShape/query",
      req,
    ),

  getByBranch: (branchId: string) =>
    api.get<ApiResponse<InvoiceShapeDto[]>>(`/api/InvoiceShape/by-branch/${branchId}`),

  getById: (id: string) =>
    api.get<ApiResponse<InvoiceShapeDto>>(`/api/InvoiceShape/${id}`),

  create: (dto: CreateInvoiceShapeDto) =>
    api.post<ApiResponse<InvoiceShapeDto>>("/api/InvoiceShape", dto),

  update: (id: string, dto: UpdateInvoiceShapeDto) =>
    api.put<ApiResponse<InvoiceShapeDto>>(`/api/InvoiceShape/${id}`, dto),

  delete: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/InvoiceShape/${id}`),
};
