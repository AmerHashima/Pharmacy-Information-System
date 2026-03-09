import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { rsdService } from "@/api/rsdService";
import { branchService } from "@/api/branchService";
import { stockService } from "@/api/stockService";
import { productService } from "@/api/productService";
import { useLookup } from "@/context/LookupContext";
import {
  BranchDto,
  RsdProductDto,
  CreateStockTransactionDto,
  FilterOperation,
} from "@/types";
import PageHeader from "@/components/shared/PageHeader";

// Components
import RSDSearchForm from "./components/RSDSearchForm";
import RSDProductTable from "./components/RSDProductTable";
import RSDEmptyState from "./components/RSDEmptyState";

export default function RSDPage() {
  const { t } = useTranslation(["sidebar", "stock"]);
  const { getLookupDetails } = useLookup();

  // State
  const [dispatchNotificationId, setDispatchNotificationId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [products, setProducts] = useState<RsdProductDto[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [fromGLN, setFromGLN] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchService.getAll();
        setBranches(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, []);

  const handleFetch = useCallback(async () => {
    if (!dispatchNotificationId || !branchId) {
      toast.error("Please provide a Notification ID and Branch ID");
      return;
    }

    setIsLoading(true);
    setProducts([]);
    setSelectedIndices([]);
    setIsEdited(false);
    try {
      const res = await rsdService.getDispatchDetail({
        dispatchNotificationId,
        branchId,
      });

      if (res.data.success && res.data.data?.products) {
        setProducts(res.data.data.products);
        setFromGLN(res.data.data.fromGLN);
        toast.success(res.data.message || "Details fetched successfully");
      } else {
        toast.error(res.data.message || "Failed to fetch details");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [dispatchNotificationId, branchId]);

  const createStockTransaction = useCallback(
    async (acceptedProducts: RsdProductDto[]) => {
      try {
        const transactionTypes = getLookupDetails("TRANSACTION_TYPE");
        const stockInType = transactionTypes.find(
          (type) =>
            type.valueNameEn?.toLowerCase().includes("stock in") ||
            type.valueNameEn?.toLowerCase().includes("purchase") ||
            type.lookupDetailCode === "STOCK_IN",
        );

        if (!stockInType) {
          toast.error("Stock In transaction type not found");
          return;
        }

        const details = await Promise.all(
          acceptedProducts.map(async (p, index) => {
            const pRes = await productService.query({
              request: {
                pagination: { pageNumber: 1, pageSize: 1 },
                filters: [
                  {
                    propertyName: "gtin",
                    value: p.gtin || "",
                    operation: FilterOperation.Equals,
                  },
                ],
              },
            });

            const internalProduct = pRes.data.data?.data?.[0];

            return {
              productId: internalProduct?.oid || "",
              productName: internalProduct?.drugName || "Unknown Product",
              quantity: p.quantity,
              gtin: p.gtin || "",
              batchNumber: p.batchNumber || "",
              expiryDate: p.expiryDate || "",
              unitCost: 0,
              totalCost: 0,
              lineNumber: index + 1,
              notes: "RSD Automated Stock In",
            };
          }),
        );

        const missingProducts = details.filter((d) => !d.productId);
        if (missingProducts.length > 0) {
          toast.error(
            `${missingProducts.length} products were not found in the system by GTIN.`,
          );
        }

        const dto: CreateStockTransactionDto = {
          transactionTypeId: stockInType.oid,
          toBranchId: branchId,
          referenceNumber: dispatchNotificationId,
          notificationId: dispatchNotificationId,
          transactionDate: new Date().toISOString().split("T")[0],
          status: "APPROVED",
          details: details.filter((d) => d.productId),
        };

        const res = await stockService.createStockTransaction(dto);
        if (res.data.success) {
          toast.success("Internal stock transaction created successfully");
        } else {
          toast.error("Failed to create internal stock transaction");
        }
      } catch (err) {
        console.error("Failed to sync with stock", err);
        toast.error("Error syncing with stock management");
      }
    },
    [branchId, dispatchNotificationId, getLookupDetails],
  );

  const handleAccept = useCallback(async () => {
    if (selectedIndices.length === 0) {
      toast.error("No products selected to accept");
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      let finalProducts: RsdProductDto[] = [];
      const selectedProducts = products.filter((_, i) =>
        selectedIndices.includes(i),
      );

      const isAllSelected = selectedIndices.length === products.length;

      if (isAllSelected && !isEdited) {
        const res = await rsdService.acceptDispatch({
          dispatchNotificationId,
          branchId,
        });
        success = res.data.success;
        if (success) {
          finalProducts = products;
          toast.success("Dispatch accepted successfully (Direct)");
        } else {
          toast.error(res.data.message || "Failed to accept dispatch");
        }
      } else {
        const res = await rsdService.acceptBatch({
          branchId,
          fromGLN,
          products: selectedProducts.map((p) => ({
            gtin: p.gtin,
            quantity: p.quantity,
            batchNumber: p.batchNumber,
            expiryDate: p.expiryDate,
          })),
        });
        success = res.data.success;
        if (success && res.data.data?.products) {
          finalProducts = res.data.data.products;
          toast.success("Dispatch accepted successfully (Batch)");
        } else {
          toast.error(res.data.message || "Failed to accept batch");
        }
      }

      if (success) {
        await createStockTransaction(finalProducts);
        setProducts([]);
        setSelectedIndices([]);
        setIsEdited(false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "An error occurred during acceptance",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    products,
    selectedIndices,
    isEdited,
    dispatchNotificationId,
    branchId,
    fromGLN,
    createStockTransaction,
  ]);

  const updateProduct = useCallback(
    (index: number, field: keyof RsdProductDto, value: any) => {
      setProducts((prev) => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], [field]: value };
        return newProducts;
      });
      setIsEdited(true);
    },
    [],
  );

  const toggleSelect = useCallback((index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIndices((prev) => {
      if (prev.length === products.length) {
        return [];
      } else {
        return products.map((_, i) => i);
      }
    });
  }, [products.length]);

  const canAcceptDirect =
    selectedIndices.length === products.length && !isEdited;

  return (
    <div className="space-y-6">
      <PageHeader title={t("sidebar:rsd")} />

      <RSDSearchForm
        dispatchNotificationId={dispatchNotificationId}
        setDispatchNotificationId={setDispatchNotificationId}
        branchId={branchId}
        setBranchId={setBranchId}
        branches={branches}
        isLoading={isLoading}
        onFetch={handleFetch}
      />

      <RSDProductTable
        products={products}
        selectedIndices={selectedIndices}
        isEdited={isEdited}
        isLoading={isLoading}
        canAcceptDirect={canAcceptDirect}
        dispatchNotificationId={dispatchNotificationId}
        onAccept={handleAccept}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onUpdateProduct={updateProduct}
      />

      {products.length === 0 && <RSDEmptyState isLoading={isLoading} />}
    </div>
  );
}
