import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { Save, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

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
  FilterOperation,
} from "@/types";

import TransactionHeader from "./components/TransactionHeader";
import TransactionGeneralInfo from "./components/TransactionGeneralInfo";
import TransactionItemsTable from "./components/TransactionItemsTable";
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

  const PRODUCTS_PAGE_SIZE = 20;
  const currentSearchRef = useRef<string | undefined>(undefined);

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch static data first
        const [bRes, sRes] = await Promise.all([
          branchService.query({
            request: {
              pagination: { getAll: true, pageNumber: 1, pageSize: 100 },
              sort: [{ sortBy: "branchName", sortDirection: "asc" }],
            },
          }),
          stakeholderService.query({
            request: {
              pagination: { getAll: true, pageNumber: 1, pageSize: 100 },
              filters: [
                {
                  propertyName: "StakeholderTypeCode",
                  value: "VENDOR", // Upgraded from SUPPLIER
                  operation: FilterOperation.Equals,
                },
              ],
              sort: [{ sortBy: "name", sortDirection: "asc" }],
            },
          }),
        ]);

        if (bRes.data.success && bRes.data.data)
          setBranches(bRes.data.data.data);
        if (sRes.data.success && sRes.data.data)
          setSuppliers(sRes.data.data.data);

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/stock/transactions")}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <PageHeader title={t("edit_transaction")} />
      </div>

      <FormProvider {...methods}>
        <div className="space-y-6">
          <TransactionHeader typeCode={typeCode || ""} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TransactionGeneralInfo
              typeCode={typeCode || ""}
              transactionTypeOptions={getTransactionTypeOptions()}
              branchOptions={getBranchOptions()}
              supplierOptions={getSupplierOptions()}
            />

            <TransactionItemsTable
              products={products}
              setProducts={setProducts}
              debouncedFetchProducts={debouncedFetchProducts}
              onLoadMoreProducts={handleLoadMoreProducts}
              productsHasMore={productsHasMore}
              isLoadingMoreProducts={isLoadingMoreProducts}
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
    </div>
  );
}
