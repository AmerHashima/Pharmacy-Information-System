import { useState, useEffect, useCallback, useRef } from "react";
import {
  Eye,
  Calendar,
  User as UserIcon,
  CreditCard,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useLookup } from "@/context/LookupContext";
import { Link } from "react-router-dom";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { returnInvoiceService } from "@/api/returnInvoiceService";
import { useQueryTable } from "@/hooks/useQuery";
import { ReturnInvoiceDto, FilterOperation } from "@/types";

export default function RefundHistory() {
  const { t, i18n } = useTranslation("sales");
  const { getLookupValue } = useLookup();
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, pageNumber, setPageNumber, totalPages, fetch } =
    useQueryTable<ReturnInvoiceDto>({
      service: returnInvoiceService.query,
      pageSize: 10,
    });

  const loadData = useCallback(() => {
    const filters = [];
    if (searchTerm) {
      filters.push({
        propertyName: "returnNumber",
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
      header: t("refund_number", { defaultValue: "Refund #" }),
      accessorKey: "returnNumber",
      cell: (info: any) => (
        <span className="font-bold text-red-600 font-mono tracking-tight">
          {info.getValue()}
        </span>
      ),
    },
    {
      header: tc("date"),
      accessorKey: "returnDate",
      cell: (info: any) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {info.getValue()
              ? format(new Date(info.getValue()), "MMM dd, yyyy HH:mm")
              : "---"}
          </span>
        </div>
      ),
    },
    // {
    //   header: t("original_invoice", { defaultValue: "Orig. Invoice" }),
    //   accessorKey: "originalInvoiceNumber",
    //   cell: (info: any) => (
    //     <div className="flex items-center gap-1.5">
    //       <Hash className="h-3.5 w-3.5 text-gray-400" />
    //       <span className="font-medium text-gray-600">
    //         {info.getValue() || "---"}
    //       </span>
    //     </div>
    //   ),
    // },
    {
      header: t("customer"),
      accessorKey: "customerName",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
            <UserIcon className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <span className="font-semibold text-gray-900">
            {info.getValue() || t("walk_in_customer")}
          </span>
        </div>
      ),
    },
    {
      header: t("amount"),
      accessorKey: "totalAmount",
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">
            ${info.getValue()?.toFixed(2)}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            VAT: ${info.row.original.taxAmount?.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      header: tc("status"),
      accessorKey: "statusName",
      cell: (info: any) => {
        return (
          <Badge variant="default">{info.getValue() || t("completed")}</Badge>
        );
      },
    },
    {
      header: tc("actions"),
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-1">
          <Link to={`/sales/refund/${info.row.original.oid}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600  p-0 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("search_refund_placeholder", {
            defaultValue: "Search refunds...",
          })}
        />
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
