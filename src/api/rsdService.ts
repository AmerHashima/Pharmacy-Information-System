import api from "./axios";
import {
  RsdDispatchDetailRequest,
  RsdDispatchDetailResponseData,
  RsdAcceptDispatchRequest,
  RsdAcceptDispatchResponseData,
  RsdAcceptBatchRequest,
  RsdAcceptBatchResponseData,
  ApiResponse,
  QueryRequest,
  PagedResult,
  RsdOperationLogDto,
  RsdOperationLogDetailDto,
  RsdDrugListSyncRequest,
} from "@/types";

export const rsdService = {
  getDispatchDetail: (data: RsdDispatchDetailRequest) =>
    api.post<ApiResponse<RsdDispatchDetailResponseData>>(
      "/api/RsdIntegration/dispatch-detail",
      data,
    ),

  acceptDispatch: (data: RsdAcceptDispatchRequest) =>
    api.post<ApiResponse<RsdAcceptDispatchResponseData>>(
      "/api/RsdIntegration/accept-dispatch",
      data,
    ),

  acceptBatch: (data: RsdAcceptBatchRequest) =>
    api.post<ApiResponse<RsdAcceptBatchResponseData>>(
      "/api/RsdIntegration/accept-batch",
      data,
    ),
  queryOperationLogs: (data: QueryRequest) =>
    api.post<ApiResponse<PagedResult<RsdOperationLogDto>>>(
      "/api/RsdIntegration/operation-logs/query",
      data,
    ),
  getOperationLog: (id: string) =>
    api.get<ApiResponse<RsdOperationLogDetailDto>>(
      `/api/RsdIntegration/operation-logs/${id}`,
    ),
  syncDrugList: (data: RsdDrugListSyncRequest) =>
    api.post<ApiResponse<string>>(
      "/api/RsdIntegration/drug-list/sync",
      data,
    ),
};
