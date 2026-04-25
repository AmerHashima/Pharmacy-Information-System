import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { Save, ArrowLeft, Loader2, Trash2, Undo2, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useLookup } from "@/context/LookupContext";
import { branchService } from "@/api/branchService";
import { stakeholderService } from "@/api/stakeholderService";
import { productService } from "@/api/productService";
import { stockService } from "@/api/stockService";
import {
  BranchDto,
  StakeholderDto,
  ProductDto,
  CreateStockTransactionDto as UpdateStockTransactionDto,
  StockTransactionResponseDto,
  FilterOperation,
} from "@/types";

import TransactionHeader from "./components/TransactionHeader";
import TransactionGeneralInfo from "./components/TransactionGeneralInfo";
import TransactionItemsTable from "./components/TransactionItemsTable";
import PrintableStockTransaction from "./components/PrintableStockTransaction";
import PageHeader from "@/components/shared/PageHeader";

export default function StockTransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("stock");
  const { getLookupDetails } = useLookup();
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [suppliers, setSuppliers] = useState<StakeholderDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionData, setTransactionData] =
    useState<StockTransactionResponseDto | null>(null);

  const printComponentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `StockTransaction_${transactionData?.referenceNumber || id}`,
  });

  const PRODUCTS_PAGE_SIZE = 20;
  const currentSearchRef = useRef<string | undefined>(undefined);

  // Pagination states for branches
  const [branchesPage, setBranchesPage] = useState(1);
  const [branchesHasMore, setBranchesHasMore] = useState(true);
  const [isLoadingMoreBranches, setIsLoadingMoreBranches] = useState(false);
  const currentBranchSearchRef = useRef<string | undefined>("");
  const branchSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pagination states for suppliers
  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersHasMore, setSuppliersHasMore] = useState(true);
  const [isLoadingMoreSuppliers, setIsLoadingMoreSuppliers] = useState(false);
  const currentSupplierSearchRef = useRef<string | undefined>("");
  const supplierSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transactionTypes = getLookupDetails("TRANSACTION_TYPE");

  const schema = z.object({
    transactionTypeId: z.string().min(1, t("transaction_type_required")),
    fromBranchId: z.string().optional(),
    toBranchId: z.string().optional(),
    supplierId: z.string().optional(),
    referenceNumber: z.string().min(1, t("reference_number_required")),
    notes: z.string().optional(),
    transactionDate: z.string().min(1, t("date_required")),
    details: z
      .array(
        z.object({
          productId: z.string().min(1, t("product_required")),
          qrcode: z.string().optional(),
          quantity: z.number().min(0.01, t("quantity_min")),
          productPrice: z.number().min(0).optional(),
          discountPercentOne: z.number().min(0).max(100).optional(),
          discountPercentTwo: z.number().min(0).max(100).optional(),
          unitCost: z.number().min(0),
          batchNumber: z.string().min(1, t("batch_number_required")),
          expiryDate: z.string().min(1, t("expiry_date_required")),
          notes: z.string().optional(),
        }),
      )
      .min(1, t("at_least_one_item")),
  });

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionDate: new Date().toISOString().split("T")[0],
      details: [],
    },
  });

  const { handleSubmit, watch, reset, getValues, setValue } = methods;

  const selectedTypeId = watch("transactionTypeId");
  const selectedType = transactionTypes.find(
    (type) => type.oid === selectedTypeId,
  );
  const typeCode = selectedType?.oid;

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchProducts = async (
    search: string | undefined,
    page: number,
    replace: boolean,
  ) => {
    setIsLoadingMoreProducts(true);
    try {
      const res = await productService.query({
        request: {
          pagination: { pageNumber: page, pageSize: PRODUCTS_PAGE_SIZE },
          filters: search
            ? [{ propertyName: "drugName", value: search, operation: 2 }]
            : [],
        },
      });
      if (res.data.success && res.data.data) {
        const fetched = res.data.data.data;
        const hasNext = res.data.data.hasNextPage;
        setProducts((prev) => {
          const currentDetails = getValues("details") || [];
          const selectedIds = currentDetails
            .map((d) => d.productId)
            .filter(Boolean);
          const selectedProducts = prev.filter((p) =>
            selectedIds.includes(p.oid),
          );
          if (replace) {
            const merged = [...fetched];
            selectedProducts.forEach((sp) => {
              if (!merged.find((m) => m.oid === sp.oid)) merged.push(sp);
            });
            return merged;
          } else {
            const merged = [...prev];
            fetched.forEach((p) => {
              if (!merged.find((m) => m.oid === p.oid)) merged.push(p);
            });
            return merged;
          }
        });
        setProductsHasMore(hasNext);
        setProductsPage(page);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setIsLoadingMoreProducts(false);
    }
  };

  const debouncedFetchProducts = (search: string) => {
    currentSearchRef.current = search || undefined;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(currentSearchRef.current, 1, true);
    }, 300);
  };

  const handleLoadMoreProducts = () => {
    if (!productsHasMore || isLoadingMoreProducts) return;
    fetchProducts(currentSearchRef.current, productsPage + 1, false);
  };

  const DEVICES_PAGESIZE = 10;

  const fetchBranches = async (search = "", page = 1, replace = false) => {
    try {
      setIsLoadingMoreBranches(true);
      const res = await branchService.query({
        request: {
          pagination: {
            getAll: false,
            pageNumber: page,
            pageSize: DEVICES_PAGESIZE,
          },
          filters: search
            ? [{ propertyName: "branchName", value: search, operation: 2 }]
            : [],
          sort: [{ sortBy: "branchName", sortDirection: "asc" }],
        },
      });
      if (res.data.success && res.data.data) {
        const fetched = res.data.data.data;
        const hasNext = res.data.data.hasNextPage;
        setBranches((prev) => {
          if (replace) return fetched;
          const merged = [...prev];
          fetched.forEach((b) => {
            if (!merged.find((m) => m.oid === b.oid)) merged.push(b);
          });
          return merged;
        });
        setBranchesHasMore(hasNext);
        setBranchesPage(page);
      }
    } catch (err) {
      console.error("Failed to fetch branches", err);
    } finally {
      setIsLoadingMoreBranches(false);
    }
  };

  const debouncedFetchBranches = (search: string) => {
    currentBranchSearchRef.current = search || undefined;
    if (branchSearchTimeoutRef.current)
      clearTimeout(branchSearchTimeoutRef.current);
    branchSearchTimeoutRef.current = setTimeout(() => {
      fetchBranches(currentBranchSearchRef.current, 1, true);
    }, 300);
  };

  const handleLoadMoreBranches = () => {
    if (!branchesHasMore || isLoadingMoreBranches) return;
    fetchBranches(currentBranchSearchRef.current, branchesPage + 1, false);
  };

  const fetchSuppliers = async (search = "", page = 1, replace = false) => {
    try {
      setIsLoadingMoreSuppliers(true);
      const filters = [
        {
          propertyName: "StakeholderTypeCode",
          value: "VENDOR",
          operation: FilterOperation.Equals,
        },
      ];
      if (search) {
        filters.push({ propertyName: "name", value: search, operation: 2 });
      }

      const res = await stakeholderService.query({
        request: {
          pagination: {
            getAll: false,
            pageNumber: page,
            pageSize: DEVICES_PAGESIZE,
          },
          filters,
          sort: [{ sortBy: "name", sortDirection: "asc" }],
        },
      });
      if (res.data.success && res.data.data) {
        const fetched = res.data.data.data;
        const hasNext = res.data.data.hasNextPage;
        setSuppliers((prev) => {
          if (replace) return fetched;
          const merged = [...prev];
          fetched.forEach((s) => {
            if (!merged.find((m) => m.oid === s.oid)) merged.push(s);
          });
          return merged;
        });
        setSuppliersHasMore(hasNext);
        setSuppliersPage(page);
      }
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    } finally {
      setIsLoadingMoreSuppliers(false);
    }
  };

  const debouncedFetchSuppliers = (search: string) => {
    currentSupplierSearchRef.current = search || undefined;
    if (supplierSearchTimeoutRef.current)
      clearTimeout(supplierSearchTimeoutRef.current);
    supplierSearchTimeoutRef.current = setTimeout(() => {
      fetchSuppliers(currentSupplierSearchRef.current, 1, true);
    }, 300);
  };

  const handleLoadMoreSuppliers = () => {
    if (!suppliersHasMore || isLoadingMoreSuppliers) return;
    fetchSuppliers(currentSupplierSearchRef.current, suppliersPage + 1, false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch initial paged data for dependencies
        try {
          await Promise.all([
            fetchBranches(undefined, 1, true),
            fetchSuppliers(undefined, 1, true),
          ]);
        } catch (e) {
          console.error("Failed to load dependency metadata", e);
        }

        // Fetch transaction data
        if (id) {
          const tRes = await stockService.getById(id);
          if (tRes.data.success && tRes.data.data) {
            const tData = tRes.data.data;
            setTransactionData(tData);

            const initialDetails = tData.details.map((d) => ({
              productId: d.productId,
              quantity: d.quantity,
              productPrice: d.productPrice ?? d.unitCost,
              discountPercentOne: d.discountPercentOne ?? 0,
              discountPercentTwo: d.discountPercentTwo ?? 0,
              unitCost: d.unitCost,
              batchNumber: d.batchNumber || "",
              expiryDate: d.expiryDate?.split("T")[0] || "",
              notes: d.notes || "",
              qrcode: "",
            }));

            // Format for form
            reset({
              transactionTypeId: tData.transactionTypeId,
              fromBranchId: tData.fromBranchId || undefined,
              toBranchId: tData.toBranchId || undefined,
              supplierId: tData.supplierId || undefined,
              referenceNumber: tData.referenceNumber || "",
              notes: tData.notes || "",
              transactionDate: tData.transactionDate?.split("T")[0] || "",
              details: initialDetails,
            });

            // Pre-populate products from details to ensure labels are visible immediately
            const detailedProducts = tData.details.map(
              (d) =>
                ({
                  oid: d.productId,
                  drugName: d.productName || "Product",
                  gtin: d.productGTIN || "",
                  price: d.productPrice ?? d.unitCost,
                }) as ProductDto,
            );
            setProducts(detailedProducts);

            try {
              await fetchProducts(undefined, 1, true);
            } catch (err) {
              console.error("Failed to fetch additional products", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch dependencies", err);
        toast.error(t("error_loading_transaction"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, reset, t]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const dto: UpdateStockTransactionDto = {
        ...data,
        oid: id,
        status: "PENDING",
        details: data.details.map((d, index) => ({
          ...d,
          lineNumber: index + 1,
          totalCost: d.quantity * d.unitCost,
        })),
      };

      const res = await stockService.update(id, dto);
      if (res.data.success) {
        toast.success(t("transaction_updated_success"));
        navigate("/stock/transactions");
      } else {
        toast.error(res.data.message || t("transaction_failed"));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("error_occurred"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const res = await stockService.delete(id);
      if (res.data.success) {
        toast.success(t("delete_success"));
        navigate("/stock/transactions");
      } else {
        toast.error(res.data.message || t("delete_failed"));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("error_occurred"));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getBranchOptions = () =>
    branches.map((b) => ({ value: b.oid, label: b.branchName }));

  const getSupplierOptions = () =>
    suppliers.map((s) => ({ value: s.oid, label: s.name }));

  const getTransactionTypeOptions = () =>
    transactionTypes.map((t) => ({
      value: t.oid,
      label:
        i18n.language === "ar"
          ? t.valueNameAr || t.valueNameEn || ""
          : t.valueNameEn || "",
    }));

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto ">
      <div className="flex items-center gap-4">
        <PageHeader title={t("edit_transaction")} />
      </div>

      <FormProvider {...methods}>
        <div className="space-y-4 w-full ">
          <div className="flex items-center gap-4 px-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/stock/transactions")}
              className=""
            >
              <ArrowLeft size={20} />
            </Button>
            <TransactionHeader typeCode={typeCode || ""} className="w-full" />

            <div className="flex items-center gap-2 ms-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/stock/transactions/${id}/return`)}
                className="whitespace-nowrap px-4 flex items-center gap-2 text-red-600 underline"
              >
                <Undo2 size={20} />
                {t("return_items", "Return Items")}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handlePrint()}
                className="whitespace-nowrap flex items-center gap-2 font-bold"
              >
                <Printer size={18} />
                {t("print", "Print")}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TransactionGeneralInfo
              typeCode={typeCode || ""}
              transactionTypeOptions={getTransactionTypeOptions()}
              branchOptions={getBranchOptions()}
              supplierOptions={getSupplierOptions()}
              debouncedFetchBranches={debouncedFetchBranches}
              onLoadMoreBranches={handleLoadMoreBranches}
              branchesHasMore={branchesHasMore}
              isLoadingMoreBranches={isLoadingMoreBranches}
              debouncedFetchSuppliers={debouncedFetchSuppliers}
              onLoadMoreSuppliers={handleLoadMoreSuppliers}
              suppliersHasMore={suppliersHasMore}
              isLoadingMoreSuppliers={isLoadingMoreSuppliers}
            />

            <TransactionItemsTable
              products={products}
              setProducts={setProducts}
              debouncedFetchProducts={debouncedFetchProducts}
              onLoadMoreProducts={handleLoadMoreProducts}
              productsHasMore={productsHasMore}
              isLoadingMoreProducts={isLoadingMoreProducts}
              showPricingDetails={true}
            />

            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                isLoading={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 size={18} />
                {t("delete")}
              </Button>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/stock/transactions")}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  isLoading={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save size={18} />
                  {t("update_transaction")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </FormProvider>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("delete_confirm_title")}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">{t("delete_confirm_message")}</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              {t("delete")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Hidden printable stock transaction receipt */}
      {transactionData && (
        <PrintableStockTransaction
          ref={printComponentRef}
          transactionData={transactionData}
        />
      )}
    </div>
  );
}
