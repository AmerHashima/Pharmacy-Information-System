import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import { useLookup } from "@/context/LookupContext";
import { stockService } from "@/api/stockService";
import { CreateStockTransactionDto } from "@/types";
import {
  usePaginatedProducts,
  usePaginatedBranches,
  usePaginatedSuppliers,
} from "@/hooks/queries";

import TransactionGeneralInfo from "./TransactionGeneralInfo";
import TransactionItemsTable from "./TransactionItemsTable";
import { useEffect } from "react";

interface NewTransactionFormProps {
  onTransactionTypeChange?: (isOpening: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewTransactionForm({
  onTransactionTypeChange,
}: NewTransactionFormProps) {

  const { t, i18n } = useTranslation("stock");
  const { getLookupDetails } = useLookup();
  const transactionTypes = getLookupDetails("TRANSACTION_TYPE");

  // ─── Schema ───────────────────────────────────────────────────────────────

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

  const { handleSubmit, watch, reset, getValues } = methods;

  const selectedTypeId = watch("transactionTypeId");
  const selectedType = transactionTypes.find((t) => t.oid === selectedTypeId);
  const typeCode = selectedType?.oid;

  useEffect(() => {
    if (onTransactionTypeChange) {
      onTransactionTypeChange(selectedTypeId === "aeaf572c-3e60-49df-bdb9-9a9dc29e1d34");
    }
  }, [selectedTypeId, onTransactionTypeChange]);

  // ─── Products — paginated + cached via TanStack Query ────────────────────

  const selectedProductIds = (getValues("details") || [])
    .map((d) => d.productId)
    .filter(Boolean);

  const {
    options: products,
    setOptions: setProducts,
    setSearch: debouncedFetchProducts,
    loadMore: handleLoadMoreProducts,
    hasMore: productsHasMore,
    isLoadingMore: isLoadingMoreProducts,
  } = usePaginatedProducts({ preserveIds: selectedProductIds });

  // ─── Branches — paginated + cached via TanStack Query ────────────────────

  const {
    options: branches,
    setSearch: debouncedFetchBranches,
    loadMore: handleLoadMoreBranches,
    hasMore: branchesHasMore,
    isLoadingMore: isLoadingMoreBranches,
  } = usePaginatedBranches();

  // ─── Suppliers — paginated + cached via TanStack Query ───────────────────

  const {
    options: suppliers,
    setSearch: debouncedFetchSuppliers,
    loadMore: handleLoadMoreSuppliers,
    hasMore: suppliersHasMore,
    isLoadingMore: isLoadingMoreSuppliers,
  } = usePaginatedSuppliers();

  // ─── Submission ───────────────────────────────────────────────────────────

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const dto: CreateStockTransactionDto = {
        ...data,
        status: "PENDING",
        details: data.details.map((d, index) => ({
          ...d,
          lineNumber: index + 1,
          totalCost: d.quantity * d.unitCost,
        })),
      };
      const res = await stockService.createStockTransaction(dto);
      if (res.data.success) {
        toast.success(t("transaction_created_success"));
        reset();
      } else {
        toast.error(res.data.message || t("transaction_failed"));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("error_occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <TransactionGeneralInfo
            typeCode={typeCode || ""}
            transactionTypeOptions={transactionTypes.map((tx) => ({
              value: tx.oid,
              label:
                i18n.language === "ar"
                  ? tx.valueNameAr || tx.valueNameEn || ""
                  : tx.valueNameEn || "",
            }))}
            branchOptions={branches.map((b) => ({
              value: b.oid,
              label: b.branchName,
            }))}
            supplierOptions={suppliers.map((s) => ({
              value: s.oid,
              label: s.name,
            }))}
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
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => reset()}>
              {t("clear")}
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex items-center gap-2"
            >
              <Save size={18} />
              {t("save_transaction")}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
