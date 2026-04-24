import api from "./axios";
import {
    ApiResponse,
    BooleanApiResponse,
    InvoiceSetupDto,
    CreateInvoiceSetupDto,
    UpdateInvoiceSetupDto,
    PagedResult,
    QueryRequest,
} from "@/types";

export const invoiceSetupService = {
    getByBranch: (branchId: string) =>
        api.get<ApiResponse<InvoiceSetupDto[]>>(`/api/InvoiceSetup/branch/${branchId}`),

    getGlobal: () => api.get<ApiResponse<InvoiceSetupDto[]>>("/api/InvoiceSetup/global"),

    query: (req: QueryRequest) =>
        api.post<ApiResponse<PagedResult<InvoiceSetupDto>>>("/api/InvoiceSetup/query", req),

    create: (dto: CreateInvoiceSetupDto) =>
        api.post<ApiResponse<InvoiceSetupDto>>("/api/InvoiceSetup", dto),

    update: (dto: UpdateInvoiceSetupDto) =>
        api.put<ApiResponse<InvoiceSetupDto>>("/api/InvoiceSetup", dto),

    delete: (id: string) =>
        api.delete<BooleanApiResponse>(`/api/InvoiceSetup/${id}`),
};
