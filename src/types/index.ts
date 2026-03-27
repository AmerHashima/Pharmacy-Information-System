// ─── Base API Response ───────────────────────────────────────────────────────

export interface ApiResponse<T = null> {
  success: boolean;
  message: string | null;
  data: T;
  errors: Record<string, string[]> | null;
  innerException: string | null;
  statusCode: number;
  timestamp: string;
  traceId: string | null;
}

// ─── BooleanApiResponse ───────────────────────────────────────────────────────
// Used as the return type for DELETE on IntegrationProvider and BranchIntegrationSetting

export interface BooleanApiResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: Record<string, string[]> | null;
  innerException: string | null;
  statusCode: number;
  timestamp: string;
  traceId: string | null;
}

export interface PagedResult<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  metadata: Record<string, unknown> | null;
}

// ─── Query / Filter System ────────────────────────────────────────────────────

export enum FilterOperation {
  Equals = 0,
  NotEquals = 1,
  Contains = 2,
  StartsWith = 3,
  EndsWith = 4,
  GreaterThan = 5,
  LessThan = 6,
  GreaterThanOrEqual = 7,
  LessThanOrEqual = 8,
  In = 9,
  NotIn = 10,
  IsNull = 11,
  IsNotNull = 12,
}

export class FilterRequest {
  propertyName: string;
  value: string;
  operation: FilterOperation;

  constructor(
    propertyName: string,
    value: string,
    operation: FilterOperation = FilterOperation.Contains,
  ) {
    this.propertyName = propertyName;
    this.value = value;
    this.operation = operation;
  }
}

export interface SortRequest {
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export interface PaginationRequest {
  getAll?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface DataRequest {
  filters?: FilterRequest[];
  sort?: SortRequest[];
  pagination: PaginationRequest;
  columns?: string[];
}

export interface QueryRequest {
  request: DataRequest;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginDto {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  mobile?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string; // UUID
  birthDate?: string;
  roleId?: string; // UUID
}

export interface RefreshTokenDto {
  token: string;
  refreshToken: string;
}

export interface AuthResponseDto {
  token: string | null;
  refreshToken: string | null;
  expires: string;
  user: SystemUserDto;
}

// ─── SystemUser ───────────────────────────────────────────────────────────────

export interface SystemUserDto {
  oid: string;
  username: string;
  email?: string;
  mobile?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  roleId: string | number;
  roleName?: string;
  branchId?: string;
  branchName?: string;
  genderLookupId?: string | null;
  genderName?: string | null;
  status: number;
  isActive?: boolean;
  birthDate?: string | null;
  twoFactorEnabled?: boolean;
  lastLogin?: string | null;
  failedLoginCount?: number;
  lockoutEnd?: string | null;
  passwordExpiry?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSystemUserDto {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  mobile?: string;
  roleId: number;
  branchId: string;
  status: number;
}

export interface UpdateSystemUserDto extends CreateSystemUserDto {
  oid: string;
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export interface RoleDto {
  oid: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string | null;
  // Legacy fields
  roleName?: string;
  roleNameAr?: string;
  userCount?: number;
  status?: number;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  oid: string;
  name: string;
  description?: string;
}

// ─── Branch ───────────────────────────────────────────────────────────────────

export interface BranchDto {
  oid: string;
  branchCode: string | null;
  branchName: string;
  gln: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  crn: string | null;
  vatNumber: string | null;
  identifyLookupId: string | null;
  identifyLookupName: string | null;
  identifyValue: string | null;
  streetName: string | null;
  buildingNumber: string | null;
  citySubdivisionName: string | null;
  cityName: string | null;
  postalZone: string | null;
  registrationName: string | null;
  status: number | null;
  createdAt?: string;
}

export interface CreateBranchDto {
  branchCode?: string;
  branchName: string;
  gln?: string;
  city?: string;
  district?: string;
  address?: string;
  crn?: string;
  vatNumber?: string;
  identifyLookupId?: string;
  identifyValue?: string;
  streetName?: string;
  buildingNumber?: string;
  citySubdivisionName?: string;
  cityName?: string;
  postalZone?: string;
  registrationName?: string;
  status?: number;
}

export interface UpdateBranchDto extends CreateBranchDto {
  oid: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductDto {
  oid: string;
  gtin: string | null;
  barcode: string | null;
  drugName: string;
  drugNameAr: string | null;
  genericName: string | null;
  productTypeId: string | null;
  productTypeName: string | null;
  productTypeNameAr: string | null;
  strengthValue: string | null;
  strengthUnit: string | null;
  fullStrength: string | null;
  packageType: string | null;
  packageSize: string | null;
  price: number | null;
  registrationNumber: string | null;
  volume: number | null;
  unitOfVolume: string | null;
  availableQuantity?: number;
  isExportable: boolean;
  isImportable: boolean;
  drugStatus: string | null;
  marketingStatus: string | null;
  legalStatus: string | null;
  domainId: string | null;
  manufacturer: string | null;
  countryOfOrigin: string | null;
  minStockLevel: number | null;
  maxStockLevel: number | null;
  vatTypeId: string | null;
  vatTypeName: string | null;
  vatTypeNameAr: string | null;
  packageTypeId: string | null;
  packageTypeName: string | null;
  packageTypeNameAr: string | null;
  dosageFormId: string | null;
  dosageFormName: string | null;
  dosageFormNameAr: string | null;
  productGroupId: string | null;
  productGroupName: string | null;
  productGroupNameAr: string | null;
  status: number | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ProductUnitDto {
  oid: string;
  productId: string;
  productName: string | null;
  packageTypeId: string;
  packageTypeName: string | null;
  conversionFactor: number;
  price: number;
  barcode: string | null;
  createdAt: string;
}

export interface UpdateProductUnitDto {
  oid: string;
  productId: string;
  packageTypeId: string;
  conversionFactor: number;
  price: number;
  barcode: string | null;
}

export interface CreateProductUnitDto {
  productId: string;
  packageTypeId: string;
  conversionFactor: number;
  price: number;
  barcode: string | null;
}

export interface CreateProductDto {
  gtin?: string;
  barcode?: string;
  drugName: string;
  drugNameAr?: string;
  genericName?: string;
  productTypeId?: string;
  strengthValue?: string;
  strengthUnit?: string;
  packageType?: string;
  packageSize?: string;
  price?: number;
  registrationNumber?: string;
  volume?: number;
  unitOfVolume?: string;
  isExportable?: boolean;
  isImportable?: boolean;
  drugStatus?: string;
  marketingStatus?: string;
  legalStatus?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  vatTypeId?: string | null;
  packageTypeId?: string;
  dosageFormId?: string;
  productGroupId?: string | null;
  status?: number;
  domainId?: string;
}

export interface UpdateProductDto extends CreateProductDto {
  oid: string;
}

export interface ParseBarcodeRequest {
  barcodeInput: string;
}

export interface BarcodeData {
  gtin: string | null;
  serialNumber: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  productionDate: string | null;
  success: boolean;
  errorMessage: string | null;
  rawData: Record<string, string> | null;
}

export interface ParseBarcodeResponse {
  barcodeData: BarcodeData | null;
  product: ProductDto | null;
  productFound: boolean;
  productMessage: string | null;
}

// ─── Stakeholder ─────────────────────────────────────────────────────────────

export interface StakeholderDto {
  oid: string;
  name: string;
  gln?: string;
  stakeholderTypeCode: string;
  stakeholderTypeId?: string;
  stakeholderTypeName?: string;
  city?: string;
  district?: string;
  address?: string;
  isActive?: boolean;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  taxNumber?: string;
  crNumber?: string;
  status: number | null;
  createdAt?: string;
}

export interface CreateStakeholderDto {
  fullName: string;
  stakeholderTypeCode: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  taxNumber?: string;
  crNumber?: string;
  status?: number;
}

export interface UpdateStakeholderDto extends CreateStakeholderDto {
  oid: string;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export interface SalesInvoiceItemDto {
  oid: string;
  invoiceId: string;
  productId: string;
  productName: string | null;
  productGTIN: string | null;
  quantity: number;
  unitPrice: number;
  taxAmount?: number;
  totalPrice: number;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface SalesInvoiceDto {
  oid: string;
  invoiceNumber: string | null;
  branchId: string;
  branchName: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  taxAmount: number | null;
  totalAmount: number | null;
  invoiceDate: string | null;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
  invoiceStatusName: string | null;
  createdByName?: string;
  items: SalesInvoiceItemDto[] | null;
}

export interface CreateSalesInvoiceItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface CreateSalesInvoiceDto {
  branchId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  discountPercent?: number;
  invoiceDate: string;
  paymentMethodId?: string;
  cashierId?: string;
  prescriptionNumber?: string;
  doctorName?: string;
  notes?: string;
  items: CreateSalesInvoiceItemDto[];
}

// ─── Stock ────────────────────────────────────────────────────────────────────

export interface StockDto {
  oid: string;
  productId: string;
  productName: string | null;
  productGTIN: string | null;
  branchId: string;
  branchName: string | null;
  quantity: number | null;
  reservedQuantity: number | null;
  availableQuantity: number;
  minStockLevel?: number;
  expiryDate?: string;
  status: number | null;
  batchNumber: string | null;
}

export interface StockTransactionDto {
  oid: string;
  productId: string;
  productName: string | null;
  productGTIN: string | null;
  fromBranchId: string | null;
  fromBranchName: string | null;
  toBranchId: string | null;
  toBranchName: string | null;
  quantity: number;
  transactionTypeName: string;
  referenceNumber: string | null;
  transactionDate: string;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface CreateStockInDto {
  productId: string;
  branchId: string;
  supplierId?: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  referenceNumber?: string;
}

export interface CreateStockTransferDto {
  productId: string;
  fromBranchId: string;
  toBranchId: string;
  quantity: number;
  batchNumber?: string;
  referenceNumber?: string;
}

export interface StockTransactionDetailDto {
  oid?: string;
  stockTransactionId?: string;
  productId: string;
  productName?: string;
  productGTIN?: string;
  quantity: number;
  gtin?: string;
  batchNumber?: string;
  expiryDate?: string;
  serialNumber?: string;
  unitCost: number;
  totalCost: number;
  lineNumber: number;
  notes?: string;
  createdAt?: string;
}

export interface CreateStockTransactionDto {
  oid?: string;
  transactionTypeId: string;
  fromBranchId?: string;
  toBranchId?: string;
  referenceNumber?: string;
  notificationId?: string;
  transactionDate: string;
  supplierId?: string;
  notes?: string;
  status: string;
  details: StockTransactionDetailDto[];
}

export interface StockTransactionResponseDto {
  oid: string;
  transactionTypeId: string;
  transactionTypeName: string;
  fromBranchId: string | null;
  fromBranchName: string | null;
  toBranchId: string | null;
  toBranchName: string | null;
  referenceNumber: string | null;
  notificationId: string | null;
  transactionDate: string;
  totalValue: number;
  supplierId: string | null;
  supplierName: string | null;
  notes: string | null;
  status: string;
  approvedBy: string | null;
  approvedDate: string | null;
  createdAt: string;
  createdBy: string;
  details: StockTransactionDetailDto[];
}

// ─── AppLookup ────────────────────────────────────────────────────────────────

export interface AppLookupDetailDto {
  oid: string;
  masterID: string;
  lookupDetailCode: string;
  valueNameAr: string | null;
  valueNameEn: string | null;
  sortOrder?: number;
  isDefault?: boolean;
  status: number;
  isActive?: boolean;
}

export interface AppLookupMasterDto {
  oid: string;
  lookupCode: string;
  lookupNameAr: string | null;
  lookupNameEn: string | null;
  lookupName?: string; // For query results
  description?: string | null;
  isSystem?: boolean;
  status: number;
  detailCount?: number;
  lookupDetails: AppLookupDetailDto[] | null;
}

export interface CreateAppLookupMasterDto {
  lookupCode: string;
  lookupNameAr: string;
  lookupNameEn: string;
  description?: string;
  isSystem?: boolean;
  status: number;
}

export interface UpdateAppLookupMasterDto {
  oid: string;
  lookupCode: string;
  lookupNameAr: string;
  lookupNameEn: string;
  description?: string;
  isSystem: boolean;
}

// export interface CreateAppLookupDetailDto {
//   masterId: string;
//   lookupDetailCode: string;
//   valueNameAr: string;
//   valueNameEn: string;
//   status: number;
// }

export interface CreateAppLookupDetailDto {
  masterID: string;
  valueCode: string;
  valueNameAr: string;
  valueNameEn: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface UpdateAppLookupDetailDto {
  oid: string;
  lookupMasterID: string;
  valueCode: string;
  valueNameAr: string;
  valueNameEn: string;
  sortOrder?: number;
  isDefault: boolean;
  isActive: boolean;
}

// ─── IntegrationProvider ─────────────────────────────────────────────────────

export interface IntegrationProviderDto {
  oid: string;
  name: string | null;
  description: string | null;
  status: number;
  statusName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateIntegrationProviderDto {
  name?: string;
  description?: string;
  status: number;
}

export interface UpdateIntegrationProviderDto {
  oid: string;
  name?: string;
  description?: string;
  status: number;
}

// ─── BranchIntegrationSetting ────────────────────────────────────────────────

export interface BranchIntegrationSettingDto {
  oid: string;
  integrationProviderId: string;
  integrationProviderName: string | null;
  branchId: string;
  branchName: string | null;
  integrationKey: string | null;
  integrationValue: string | null;
  status: number;
  statusName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateBranchIntegrationSettingDto {
  integrationProviderId: string;
  branchId: string;
  integrationKey?: string;
  integrationValue?: string;
  status: number;
}

export interface UpdateBranchIntegrationSettingDto {
  oid: string;
  integrationProviderId: string;
  branchId: string;
  integrationKey?: string;
  integrationValue?: string;
  status: number;
}

// ─── RSD Integration ────────────────────────────────────────────────────────

export interface RsdDispatchDetailRequest {
  dispatchNotificationId: string;
  branchId: string;
}

export interface RsdProductDto {
  gtin: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  quantity: number;
  responseCode: string | null;
  /** Returned by the accept-dispatch / accept-batch response. */
  productId?: string | null;
  productName?: string | null;
}

export interface RsdDispatchDetailResponseData {
  success: boolean;
  responseCode: string | null;
  responseMessage: string | null;
  dispatchNotificationId: string | null;
  notificationDate: string | null;
  fromGLN: string | null;
  products: RsdProductDto[];
  rawResponse: string | null;
}

export interface RsdAcceptDispatchRequest {
  dispatchNotificationId: string;
  branchId: string;
}

export interface RsdAcceptDispatchResponseData {
  success: boolean;
  responseCode: string | null;
  responseMessage: string | null;
  rawResponse: string | null;
  dispatchNotificationId: string | null;
}

export interface RsdAcceptBatchRequest {
  branchId: string;
  fromGLN: string | null;
  products: {
    gtin: string | null;
    quantity: number;
    batchNumber: string | null;
    expiryDate: string | null;
  }[];
}

export interface RsdAcceptBatchResponseData {
  success: boolean;
  responseCode: string | null;
  responseMessage: string | null;
  notificationId: string | null;
  products: RsdProductDto[];
  rawResponse: string | null;
}

export interface RsdOperationLogDto {
  oid: string;
  operationTypeId: string;
  operationTypeName: string | null;
  branchId: string;
  branchName: string | null;
  gln: string | null;
  notificationId: string | null;
  success: boolean;
  responseCode: string | null;
  responseMessage: string | null;
  requestedAt: string;
  createdAt: string;
}

export interface RsdOperationLogItemDto {
  oid: string;
  gtin: string | null;
  productId: string | null;
  productName: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  quantity: number;
  serialNumber: string | null;
  responseCode: string | null;
}

export interface RsdOperationLogDetailDto extends RsdOperationLogDto {
  details: RsdOperationLogItemDto[];
}

// ─── Return Invoice ────────────────────────────────────────────────────────

export interface ReturnInvoiceItemDto {
  oid: string;
  returnInvoiceId: string;
  originalInvoiceItemId: string;
  productId: string;
  productName: string | null;
  productGTIN: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
  batchNumber: string | null;
  expiryDate: string | null;
  notes: string | null;
}

export interface ReturnInvoiceDto {
  oid: string;
  returnNumber: string | null;
  originalInvoiceId: string;
  originalInvoiceNumber: string | null;
  branchId: string;
  branchName: string | null;
  customerName: string | null;
  customerPhone: string | null;
  subTotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  refundAmount: number;
  returnDate: string;
  paymentMethodId: string;
  paymentMethodName: string | null;
  invoiceStatusId: string;
  invoiceStatusName: string | null;
  cashierId: string;
  cashierName: string | null;
  returnReasonId: string;
  returnReasonName: string | null;
  notes: string | null;
  status: number;
  createdAt: string;
  items: ReturnInvoiceItemDto[];
  itemCount: number;
}

export interface CreateReturnInvoiceItemDto {
  originalInvoiceItemId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  batchNumber: string | null;
  expiryDate: string | null;
  notes: string | null;
}

export interface CreateReturnInvoiceDto {
  originalInvoiceId: string;
  branchId: string;
  customerName: string | null;
  customerPhone: string | null;
  discountPercent: number;
  returnDate: string;
  paymentMethodId: string;
  cashierId: string;
  returnReasonId: string;
  notes: string | null;
  items: CreateReturnInvoiceItemDto[];
}

// ─── Stock Transaction Return ──────────────────────────────────────────────────

export interface StockTransactionReturnDetailDto {
  oid: string;
  stockTransactionReturnId: string;
  productId: string;
  productName: string | null;
  productGTIN: string | null;
  quantity: number;
  gtin: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  serialNumber: string | null;
  unitCost: number;
  totalCost: number;
  lineNumber: number;
  notes: string | null;
  createdAt: string;
}

export interface StockTransactionReturnDto {
  oid: string;
  transactionTypeId: string;
  transactionTypeName: string | null;
  fromBranchId: string;
  fromBranchName: string | null;
  toBranchId: string;
  toBranchName: string | null;
  referenceNumber: string | null;
  notificationId: string | null;
  transactionDate: string;
  totalValue: number;
  supplierId: string | null;
  supplierName: string | null;
  notes: string | null;
  returnInvoiceId: string | null;
  returnInvoiceNumber: string | null;
  originalTransactionId: string | null;
  status: string;
  approvedBy: string | null;
  approvedDate: string | null;
  createdAt: string;
  createdBy: string;
  details: StockTransactionReturnDetailDto[];
}

export interface CreateStockTransactionReturnDetailDto {
  productId: string;
  quantity: number;
  gtin: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  serialNumber: string | null;
  unitCost: number;
  totalCost: number;
  lineNumber: number;
  notes: string | null;
}

export interface CreateStockTransactionReturnDto {
  transactionTypeId: string;
  fromBranchId: string;
  toBranchId: string;
  referenceNumber: string | null;
  notificationId: string | null;
  transactionDate: string;
  supplierId: string | null;
  notes: string | null;
  returnInvoiceId: string | null;
  originalTransactionId: string | null;
  status: string;
  details: CreateStockTransactionReturnDetailDto[];
}
