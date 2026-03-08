import api from "./axios";
import {
  RsdDispatchDetailRequest,
  RsdDispatchDetailResponseData,
  RsdAcceptDispatchRequest,
  RsdAcceptDispatchResponseData,
  RsdAcceptBatchRequest,
  RsdAcceptBatchResponseData,
  ApiResponse,
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
};
