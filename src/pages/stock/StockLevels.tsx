import { useState, useEffect, useCallback } from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/shared/SearchBar";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { stockService } from "@/api/stockService";
import { branchService } from "@/api/branchService";
import { useQueryTable } from "@/hooks/useQuery";
import { StockDto, BranchDto, FilterOperation } from "@/types";

export default function StockLevels() {
  const { t } = useTranslation("stock");
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState<BranchDto[]>([]);

  const { data, isLoading, pageNumber, setPageNumber, totalPages, fetch } =
    useQueryTable<StockDto>({
      service: stockService.query,
      pageSize: 10,
    });

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

  const loadData = useCallback(() => {
    const filters = [];
    if (searchTerm) {
      filters.push({
        propertyName: "productName",
        value: searchTerm,
        operation: FilterOperation.Contains,
      });
    }
    if (branchId) {
      filters.push({
        propertyName: "branchId",
        value: branchId,
        operation: FilterOperation.Equals,
      });
    }
    fetch("", filters);
  }, [fetch, searchTerm, branchId, pageNumber]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPageNumber(1);
  }, [searchTerm, branchId, setPageNumber]);

  // Fetch data when filters or page changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    {
      header: t("product"),
      accessorKey: "productName",
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{info.getValue()}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
            GTIN: {info.row.original.productGTIN || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: t("branch"),
      accessorKey: "branchName",
      cell: (info: any) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: t("available"),
      accessorKey: "availableQuantity",
      cell: (info: any) => {
        const qty = info.getValue() || 0;
        const min = info.row.original.minStockLevel || 0;
        const isLow = qty <= min;
        return (
          <div className="flex flex-col">
            <span
              className={`text-lg font-black tracking-tighter ${isLow ? "text-red-600" : "text-gray-900"}`}
            >
              {qty}
            </span>
            {isLow && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase animate-pulse">
                <AlertTriangle className="h-2.5 w-2.5" />
                {t("low_stock")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: t("reserved"),
      accessorKey: "reservedQuantity",
      cell: (info: any) => (
        <span className="text-gray-400 font-bold">{info.getValue() || 0}</span>
      ),
    },
    {
      header: t("expiry"),
      accessorKey: "expiryDate",
      cell: (info: any) => (
        <span className="text-xs font-medium text-gray-500">
          {info.getValue()
            ? new Date(info.getValue()).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 sm:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {t("search_products")}
          </label>
          <SearchBar
            onSearch={setSearchTerm}
            placeholder={t("search_products_placeholder")}
          />
        </div>
        <div className="w-full sm:w-64 space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {t("branch_location")}
          </label>
          <Select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            options={branches.map((b) => ({
              value: b.oid,
              label: b.branchName ?? "",
            }))}
            className="h-[42px]"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Table columns={columns} data={data} isLoading={isLoading} />
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
        />
      </div>
    </div>
  );
}
