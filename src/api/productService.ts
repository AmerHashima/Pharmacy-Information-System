import api from "./axios";
import {
  ApiResponse,
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  PagedResult,
  QueryRequest,
  ParseBarcodeRequest,
  ParseBarcodeResponse,
  ProductUnitDto,
  UpdateProductUnitDto,
  CreateProductUnitDto,
} from "@/types";

export const productService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<ProductDto>>>("/api/Product/query", req),

  parseAndGetProduct: (req: ParseBarcodeRequest) =>
    api.post<ApiResponse<ParseBarcodeResponse>>(
      "/api/Product/parse-and-get-product",
      req,
    ),

  getAll: (params?: { productTypeId?: string; searchTerm?: string }) =>
    api.get<ApiResponse<ProductDto[]>>("/api/Product", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<ProductDto>>(`/api/Product/${id}`),

  create: (dto: CreateProductDto) =>
    api.post<ApiResponse<ProductDto>>("/api/Product", dto),

  update: (id: string, dto: UpdateProductDto) =>
    api.put<ApiResponse<ProductDto>>(`/api/Product/${id}`, dto),

  delete: (id: string) => api.delete<ApiResponse>(`/api/Product/${id}`),

  queryProductUnits: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<ProductUnitDto>>>(
      "/api/ProductUnit/query",
      req,
    ),

  createProductUnit: (dto: CreateProductUnitDto) =>
    api.post<ApiResponse<ProductUnitDto>>("/api/ProductUnit", dto),

  getProductUnitsByProductId: (productId: string) =>
    api.get<ApiResponse<ProductUnitDto[]>>(
      `/api/ProductUnit/by-product/${productId}`,
    ),

  getProductUnitById: (id: string) =>
    api.get<ApiResponse<ProductUnitDto>>(`/api/ProductUnit/${id}`),

  updateProductUnit: (id: string, dto: UpdateProductUnitDto) =>
    api.put<ApiResponse<ProductUnitDto>>(`/api/ProductUnit/${id}`, dto),

  deleteProductUnit: (id: string) =>
    api.delete<ApiResponse>(`/api/ProductUnit/${id}`),
};
