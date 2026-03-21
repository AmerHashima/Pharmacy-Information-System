import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import { useLookup } from "@/context/LookupContext";
import { branchService } from "@/api/branchService";
import { stakeholderService } from "@/api/stakeholderService";
import { productService } from "@/api/productService";
import { stockService } from "@/api/stockService";
import { stockTransactionReturnService } from "@/api/stockTransactionReturnService";
import {
  BranchDto,
  StakeholderDto,
  ProductDto,
  CreateStockTransactionReturnDto,
  FilterOperation,
} from "@/types";
import { usePaginatedBranches, usePaginatedSuppliers } from "@/hooks/queries";

import TransactionHeader from "./components/TransactionHeader";
import TransactionGeneralInfo from "./components/TransactionGeneralInfo";
import TransactionItemsTable from "./components/TransactionItemsTable";
import PageHeader from "@/components/shared/PageHeader";

export default function StockTransactionReturnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("stock");
  const { getLookupDetails } = useLookup();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const PRODUCTS_PAGE_SIZE = 20;
  const currentSearchRef = useRef<string | undefined>(undefined);

  const transactionTypes = getLookupDetails("TRANSACTION_TYPE");

  const schema = z.object({
    transactionTypeId: z.string().min(1, t("transaction_type_required")),
    fromBranchId: z.string().min(1, t("branch_required")),
    toBranchId: z.string().min(1, t("branch_required")),
    supplierId: z.string().optional(),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
    transactionDate: z.string().min(1, t("date_required")),
    details: z
      .array(
        z.object({
          productId: z.string().min(1, t("product_required")),
          qrcode: z.string().optional(),
          quantity: z.number().min(0.01, t("quantity_min")),
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

  const { handleSubmit, watch, reset, getValues } = methods;

  const selectedTypeId = watch("transactionTypeId");
  const selectedType = transactionTypes.find(
    (type) => type.oid === selectedTypeId,
  );
  const typeCode = selectedType?.oid;

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

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

  // ─── Branches — paginated ────────────────────────────────────────────────

  const {
    options: branches,
    setSearch: debouncedFetchBranches,
    loadMore: handleLoadMoreBranches,
    hasMore: branchesHasMore,
    isLoadingMore: isLoadingMoreBranches,
  } = usePaginatedBranches();

  // ─── Suppliers — paginated ───────────────────────────────────────────────

  const {
    options: suppliers,
    setSearch: debouncedFetchSuppliers,
    loadMore: handleLoadMoreSuppliers,
    hasMore: suppliersHasMore,
    isLoadingMore: isLoadingMoreSuppliers,
  } = usePaginatedSuppliers();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch transaction data
        if (id) {
          const tRes = await stockService.getById(id);
          if (tRes.data.success && tRes.data.data) {
            const tData = tRes.data.data;

            const initialDetails = tData.details.map((d) => ({
              productId: d.productId,
              quantity: d.quantity,
              unitCost: d.unitCost,
              batchNumber: d.batchNumber || "",
              expiryDate: d.expiryDate?.split("T")[0] || "",
              notes: d.notes || "",
              qrcode: "",
            }));

            // Format for form
            reset({
              transactionTypeId: tData.transactionTypeId,
              fromBranchId: tData.fromBranchId || tData.toBranchId || "",
              toBranchId: tData.toBranchId || tData.fromBranchId || "",
              supplierId: tData.supplierId || undefined,
              referenceNumber: tData.referenceNumber || "",
              notes: tData.notes || "",
              transactionDate: new Date().toISOString().split("T")[0],
              details: initialDetails,
            });

            // Pre-populate products from details to ensure labels are visible immediately
            const detailedProducts = tData.details.map(
              (d) =>
                ({
                  oid: d.productId,
                  drugName: d.productName || "Product",
                  gtin: d.productGTIN || "",
                  price: d.unitCost,
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
      const dto: CreateStockTransactionReturnDto = {
        transactionTypeId: data.transactionTypeId,
        fromBranchId: data.fromBranchId,
        toBranchId: data.toBranchId,
        supplierId: data.supplierId || null,
        referenceNumber: data.referenceNumber || null,
        notificationId: null,
        transactionDate: data.transactionDate,
        notes: data.notes || null,
        returnInvoiceId: null,
        originalTransactionId: id,
        status: "PENDING",
        details: data.details.map((d, index) => ({
          productId: d.productId,
          quantity: d.quantity,
          gtin: null,
          batchNumber: d.batchNumber,
          expiryDate: d.expiryDate || null,
          serialNumber: null,
          unitCost: d.unitCost,
          totalCost: d.quantity * d.unitCost,
          lineNumber: index + 1,
          notes: d.notes || null,
        })),
      };

      const res = await stockTransactionReturnService.create(dto);
      if (res.data.success) {
        toast.success(
          t(
            "transaction_returned_success",
            "Return transaction created successfully",
          ),
        );
        navigate("/stock/transactions");
      } else {
        toast.error(
          res.data.message ||
            t(
              "transaction_return_failed",
              "Failed to create return transaction",
            ),
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("error_occurred"));
    } finally {
      setIsSaving(false);
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
        <PageHeader title={t("return_transaction", "Return Transaction")} />
      </div>

      <FormProvider {...methods}>
        <div className="space-y-4 w-full ">
          <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/stock/transactions/${id}`)}
              className=""
            >
              <ArrowLeft size={20} />
            </Button>
            <TransactionHeader typeCode={typeCode || ""} className="w-full" />
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
              showAddProducts={false}
            />

            <div className="flex justify-end items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/stock/transactions/${id}`)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                isLoading={isSaving}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                {t("confirm_return", "Confirm Return")}
              </Button>
            </div>
          </form>
        </div>
      </FormProvider>
    </div>
  );
}
