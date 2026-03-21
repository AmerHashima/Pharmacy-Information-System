import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import { useLookup } from "@/context/LookupContext";
import { branchService } from "@/api/branchService";
import { stakeholderService } from "@/api/stakeholderService";
import { stockTransactionReturnService } from "@/api/stockTransactionReturnService";
import {
  BranchDto,
  StakeholderDto,
  ProductDto,
  FilterOperation,
} from "@/types";
import { usePaginatedBranches, usePaginatedSuppliers } from "@/hooks/queries";

import TransactionHeader from "./components/TransactionHeader";
import TransactionGeneralInfo from "./components/TransactionGeneralInfo";
import TransactionItemsTable from "./components/TransactionItemsTable";
import PageHeader from "@/components/shared/PageHeader";

export default function StockTransactionReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("stock");
  const { getLookupDetails } = useLookup();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const transactionTypes = getLookupDetails("TRANSACTION_TYPE");

  const methods = useForm({
    defaultValues: {
      transactionDate: new Date().toISOString().split("T")[0],
      details: [],
      transactionTypeId: "",
      fromBranchId: "",
      toBranchId: "",
      supplierId: "",
      referenceNumber: "",
      notes: "",
    },
  });

  const { watch, reset } = methods;

  const selectedTypeId = watch("transactionTypeId");
  const selectedType = transactionTypes.find(
    (type) => type.oid === selectedTypeId,
  );
  const typeCode = selectedType?.oid;

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
          const tRes = await stockTransactionReturnService.getById(id);
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

            reset({
              transactionTypeId: tData.transactionTypeId,
              fromBranchId: tData.fromBranchId || "",
              toBranchId: tData.toBranchId || "",
              supplierId: tData.supplierId || "",
              referenceNumber: tData.referenceNumber || "",
              notes: tData.notes || "",
              transactionDate: tData.transactionDate?.split("T")[0] || "",
              details: initialDetails as never[],
            });

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
        <PageHeader
          title={t("view_return_transaction", "View Return Transaction")}
        />
      </div>

      <FormProvider {...methods}>
        <div className="space-y-4 w-full ">
          <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/stock")}
              className=""
            >
              <ArrowLeft size={20} />
            </Button>
            <TransactionHeader typeCode={typeCode || ""} className="w-full" />
          </div>

          <form className="space-y-6">
            <TransactionGeneralInfo
              typeCode={typeCode || ""}
              transactionTypeOptions={getTransactionTypeOptions()}
              branchOptions={getBranchOptions()}
              supplierOptions={getSupplierOptions()}
              isViewMode={true}
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
              debouncedFetchProducts={() => {}}
              onLoadMoreProducts={() => {}}
              productsHasMore={false}
              isLoadingMoreProducts={false}
              showAddProducts={false}
              isViewMode={true}
            />
          </form>
        </div>
      </FormProvider>
    </div>
  );
}
