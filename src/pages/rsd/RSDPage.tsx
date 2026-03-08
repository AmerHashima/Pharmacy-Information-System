import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Search,
  Calendar,
  Hash,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
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

export default function RSDPage() {
  const { t } = useTranslation(["sidebar", "stock"]);
  const { getLookupDetails } = useLookup();
  const [dispatchNotificationId, setDispatchNotificationId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [products, setProducts] = useState<RsdProductDto[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [fromGLN, setFromGLN] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

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

  const handleFetch = async () => {
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
  };

  const createStockTransaction = async (acceptedProducts: RsdProductDto[]) => {
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
  };

  const handleAccept = async () => {
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
  };

  const updateProduct = (
    index: number,
    field: keyof RsdProductDto,
    value: any,
  ) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
    setIsEdited(true);
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === products.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(products.map((_, i) => i));
    }
  };

  const columns = [
    {
      id: "select",
      header: () => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          checked={
            products.length > 0 && selectedIndices.length === products.length
          }
          onChange={toggleSelectAll}
        />
      ),
      cell: (info: any) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          checked={selectedIndices.includes(info.row.index)}
          onChange={() => toggleSelect(info.row.index)}
        />
      ),
    },
    {
      header: "GTIN",
      accessorKey: "gtin",
      cell: (info: any) => (
        <span className="font-bold text-gray-700">{info.getValue()}</span>
      ),
    },
    {
      header: "Batch No",
      accessorKey: "batchNumber",
      cell: (info: any) => (
        <span className="text-gray-600 font-medium">{info.getValue()}</span>
      ),
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (info: any) => (
        <Input
          type="number"
          value={info.getValue()}
          onChange={(e) =>
            updateProduct(
              info.row.index,
              "quantity",
              parseInt(e.target.value) || 0,
            )
          }
          className="w-24 bg-transparent border-gray-200 focus:bg-white transition-all h-9"
          icon={<Hash size={14} />}
        />
      ),
    },
    {
      header: "Expiry Date",
      accessorKey: "expiryDate",
      cell: (info: any) => {
        const val = info.getValue();
        const dateStr = val
          ? val.includes("T")
            ? val.split("T")[0]
            : val
          : "";
        return (
          <div className="flex items-center gap-2 text-gray-600 font-medium h-9 px-3">
            <Calendar size={14} className="text-gray-400" />
            <span>{dateStr}</span>
          </div>
        );
      },
    },
  ];

  const canAcceptDirect =
    selectedIndices.length === products.length && !isEdited;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {t("sidebar:rsd")}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Drug Track and Trace System Integration
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 border-none shadow-lg bg-white rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Dispatch Notification ID
            </label>
            <Input
              placeholder="Enter Notification ID"
              value={dispatchNotificationId}
              onChange={(e) => setDispatchNotificationId(e.target.value)}
              className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-blue-500/20"
              icon={<Search size={18} />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Branch
            </label>
            <Select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              options={branches.map((b) => ({
                value: b.oid,
                label: b.branchName || "",
              }))}
              className="bg-gray-50 border-gray-100 h-[42px]"
            />
          </div>
          <Button
            onClick={handleFetch}
            disabled={isLoading}
            className="h-[42px] px-8 shadow-sm shadow-blue-200 active:scale-95 transition-transform font-bold"
          >
            {isLoading ? "Fetching..." : "Fetch Details"}
          </Button>
        </div>
      </Card>

      {products.length > 0 && (
        <Card className="overflow-hidden border-none shadow-lg bg-white rounded-3xl min-h-[300px]">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/30 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Notified Products
                </h2>
                <p className="text-xs text-gray-500 font-medium font-mono uppercase tracking-tight">
                  ID: {dispatchNotificationId}{" "}
                  {isEdited && (
                    <span className="text-amber-500 ml-2">(Edited)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                {selectedIndices.length}/{products.length} Selected
              </span>
              <Button
                variant="primary"
                size="sm"
                className="shadow-sm shadow-blue-200 flex items-center gap-2"
                disabled={isLoading || selectedIndices.length === 0}
                onClick={handleAccept}
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    {canAcceptDirect ? "Accept Direct" : "Accept Batch"}
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={products}
              isLoading={isLoading}
              className="border-separate border-spacing-0"
            />
          </div>
        </Card>
      )}

      {!isLoading && products.length === 0 && (
        <Card className="p-12 border-none shadow-lg bg-white rounded-3xl flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
            <Search size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-700">
              No Details Fetched
            </h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Enter a Dispatch Notification ID and select a branch to view and
              edit notified products.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
