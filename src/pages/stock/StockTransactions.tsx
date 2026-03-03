import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownLeft, Shuffle } from "lucide-react";
import { format } from "date-fns";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/shared/SearchBar";
import Badge from "@/components/ui/Badge";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { stockService } from "@/api/stockService";
import { useQueryTable } from "@/hooks/useQuery";
import {
  StockTransactionResponseDto,
  FilterOperation,
  FilterRequest,
} from "@/types";

export default function StockTransactions() {
  const { t } = useTranslation("stock");
  const tc = useTranslation("common").t;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<StockTransactionResponseDto>({
    service: stockService.queryStockTransactions,
    pageSize: 10,
  });

  const loadData = useCallback(() => {
    const filters = [
      new FilterRequest(
        "referenceNumber",
        searchTerm,
        FilterOperation.Contains,
      ),
    ];
    if (searchTerm) {
      filters.push({
        propertyName: "referenceNumber",
        value: searchTerm,
        operation: FilterOperation.Contains,
      });
    }
    fetch("", filters);
  }, [fetch, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, pageNumber]);

  const columns = [
    {
      header: t("reference"),
      accessorKey: "referenceNumber",
      cell: (info: any) => (
        <span className="font-mono text-xs text-gray-400">
          {info.getValue() || "---"}
        </span>
      ),
    },
    {
      header: tc("type"),
      accessorKey: "transactionTypeName",
      cell: (info: any) => {
        const type = info.getValue() || "";
        let icon = <Shuffle className="h-3 w-3" />;
        let colorClass = "bg-gray-100 text-gray-700";

        if (type.includes("In") || type.includes("Receive")) {
          icon = <ArrowDownLeft className="h-3 w-3" />;
          colorClass = "bg-green-100 text-green-700";
        } else if (type.includes("Sale") || type.includes("Out")) {
          icon = <ArrowUpRight className="h-3 w-3" />;
          colorClass = "bg-blue-100 text-blue-700";
        } else if (type.includes("Transfer")) {
          icon = <Shuffle className="h-3 w-3" />;
          colorClass = "bg-purple-100 text-purple-700";
        }

        return (
          <Badge className={`${colorClass} gap-1 px-1.5`}>
            {icon}
            {type}
          </Badge>
        );
      },
    },
    {
      header: tc("date"),
      accessorKey: "transactionDate",
      cell: (info: any) => (
        <span className="text-xs font-bold text-gray-500 font-mono">
          {info.getValue()
            ? format(new Date(info.getValue()), "MM-dd HH:mm")
            : "---"}
        </span>
      ),
    },

    // {
    //   header: t("product"),
    //   accessorKey: "details",
    //   cell: (info: any) => {
    //     const details = info.getValue() || [];
    //     if (details.length === 0)
    //       return <span className="text-gray-400">---</span>;

    //     if (details.length === 1) {
    //       return (
    //         <p className="font-bold text-gray-900 text-sm">
    //           {details[0].productName}
    //         </p>
    //       );
    //     }

    //     return (
    //       <div className="flex flex-col">
    //         <p className="font-bold text-gray-900 text-sm">
    //           {details[0].productName}
    //         </p>
    //         <p className="text-xs text-gray-500">
    //           +{details.length - 1} {t("items")}
    //         </p>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   header: t("qty"),
    //   accessorKey: "details",
    //   cell: (info: any) => {
    //     const details = info.getValue() || [];
    //     const totalQty = details.reduce(
    //       (sum: number, d: any) => sum + (d.quantity || 0),
    //       0,
    //     );
    //     return <span className="font-black text-gray-900">{totalQty}</span>;
    //   },
    // },
    {
      header: t("total_value"),
      accessorKey: "totalValue",
      cell: (info: any) => (
        <span className="font-mono text-sm font-bold text-gray-700">
          {info.getValue()?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      header: t("from_to"),
      id: "branches",
      cell: (info: any) => (
        <div className="flex flex-col text-[10px] font-bold uppercase tracking-tight">
          {info.row.original.fromBranchName && (
            <span className="text-gray-400">
              {t("from")}: {info.row.original.fromBranchName || "---"}
            </span>
          )}
          {info.row.original.toBranchName && (
            <span className="text-blue-500">
              {t("to")}: {info.row.original.toBranchName || "---"}
            </span>
          )}
        </div>
      ),
    },

    {
      header: t("supplier"),
      accessorKey: "supplierName",
      cell: (info: any) => (
        <span className="text-xs font-medium text-gray-600">
          {info.getValue() || "---"}
        </span>
      ),
    },
    // {
    //   header: tc("status"),
    //   accessorKey: "status",
    //   cell: (info: any) => {
    //     const status = info.getValue() || "PENDING";
    //     let variant: "success" | "warning" | "danger" | "default" = "default";

    //     if (status === "APPROVED" || status === "COMPLETED")
    //       variant = "success";
    //     else if (status === "PENDING") variant = "warning";
    //     else if (status === "CANCELLED") variant = "danger";

    //     return (
    //       <Badge variant={variant} className="uppercase text-[10px]">
    //         {status}
    //       </Badge>
    //     );
    //   },
    // },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("filter_placeholder")}
        />
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {t("found")} <span className="text-gray-900">{totalRecords}</span>{" "}
          {t("entries")}
        </div>
      </div>

      <div className="space-y-4">
        <Table
          columns={columns}
          data={data}
          isLoading={isLoading}
          onRowClick={(row) => navigate(`/stock/transactions/${row.oid}`)}
        />
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
        />
      </div>
    </div>
  );
}
