import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/shared/SearchBar";
import Badge from "@/components/ui/Badge";
import { rsdService } from "@/api/rsdService";
import { useQueryTable } from "@/hooks/useQuery";
import { RsdOperationLogDto, FilterOperation, FilterRequest } from "@/types";
import RsdLogDetailModal from "./components/RsdLogDetailModal";

export default function RsdLogsPage() {
  const { t } = useTranslation("rsd");
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<RsdOperationLogDto>({
    service: rsdService.queryOperationLogs,
    pageSize: 10,
  });

  const loadData = useCallback(() => {
    const filters: FilterRequest[] = [];
    if (searchTerm) {
      filters.push(
        new FilterRequest(
          "notificationId",
          searchTerm,
          FilterOperation.Contains,
        ),
      );
    }
    fetch("", filters);
  }, [fetch, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, pageNumber]);

  const columns = [
    {
      header: t("requestedAt"),
      accessorKey: "requestedAt",
      cell: (info: any) => (
        <span className="text-xs font-bold text-gray-500 font-mono">
          {info.getValue()
            ? format(new Date(info.getValue()), "yyyy-MM-dd HH:mm:ss")
            : "---"}
        </span>
      ),
    },
    {
      header: t("operationType"),
      accessorKey: "operationTypeName",
      cell: (info: any) => (
        <span className="text-sm font-medium text-gray-700">
          {info.getValue() || "---"}
        </span>
      ),
    },
    {
      header: t("branch"),
      accessorKey: "branchName",
      cell: (info: any) => (
        <span className="text-sm text-gray-600">
          {info.getValue() || "---"}
        </span>
      ),
    },
    {
      header: t("notificationId"),
      accessorKey: "notificationId",
      cell: (info: any) => (
        <span className="font-mono text-xs text-blue-600 font-semibold">
          {info.getValue() || "---"}
        </span>
      ),
    },
    {
      header: t("success"),
      accessorKey: "success",
      cell: (info: any) => {
        const success = info.getValue();
        return (
          <Badge
            variant={success ? "success" : "danger"}
            className="gap-1 px-2 py-1"
          >
            {success ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {success ? t("statusSuccess") : t("statusFailed")}
          </Badge>
        );
      },
    },
    {
      header: t("message"),
      accessorKey: "responseMessage",
      cell: (info: any) => (
        <div
          className="max-w-xs truncate text-xs text-gray-500"
          title={info.getValue()}
        >
          {info.getValue() || "---"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (info: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLogId(info.row.original.oid);
          }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title={t("viewLog")}
        >
          <Eye className="h-5 w-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("rsdLogs")} />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <SearchBar onSearch={setSearchTerm} placeholder={t("notificationId")} />
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {tc("found")} <span className="text-gray-900">{totalRecords}</span>{" "}
          {tc("entries")}
        </div>
      </div>

      <div className="space-y-4">
        <Table
          columns={columns}
          data={data}
          isLoading={isLoading}
          onRowClick={(row) => setSelectedLogId(row.oid)}
        />
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
        />
      </div>

      {selectedLogId && (
        <RsdLogDetailModal
          logId={selectedLogId}
          onClose={() => setSelectedLogId(null)}
        />
      )}
    </div>
  );
}
