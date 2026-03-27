import { useState, useEffect, useCallback, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Eye,
  Printer,
  Calendar,
  User as UserIcon,
  CreditCard,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useTranslation } from "react-i18next";
import { useLookup } from "@/context/LookupContext";
import { Link } from "react-router-dom";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { salesService } from "@/api/salesService";
import { useQueryTable } from "@/hooks/useQuery";
import { SalesInvoiceDto, FilterOperation } from "@/types";
import PrintableInvoice from "./detail-page/PrintableInvoice";

export default function SalesHistory() {
  const { t, i18n } = useTranslation("sales");
  const { getLookupValue } = useLookup();
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const [selectedInvoice, setSelectedInvoice] =
    useState<SalesInvoiceDto | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${selectedInvoice?.invoiceNumber}`,
  });

  const handlePrintRow = (invoice: SalesInvoiceDto) => {
    setSelectedInvoice(invoice);
    // useReactToPrint will work because handlePrint is a stable function
    // but we need to wait for the state to update if we were relying on it in the same render.
    // However, react-to-print captures the content at the time of calling.
    // Actually, setting state and calling handlePrint immediately might be tricky.
    // Better way: trigger print in an effect or use the promise-based version if available.
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const { data, isLoading, pageNumber, setPageNumber, totalPages, fetch } =
    useQueryTable<SalesInvoiceDto>({
      service: salesService.query,
      pageSize: 10,
    });

  const loadData = useCallback(() => {
    const filters = [];
    if (searchTerm) {
      filters.push({
        propertyName: "invoiceNumber",
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
      header: t("invoice_number"),
      accessorKey: "invoiceNumber",
      cell: (info: any) => (
        <span className="font-bold text-blue-600 font-mono tracking-tight">
          {info.getValue()}
        </span>
      ),
    },
    {
      header: tc("date"),
      accessorKey: "invoiceDate",
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
      header: t("payment_method"),
      accessorKey: "paymentMethodName",
      cell: (info: any) => (
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">
            {getLookupValue(
              "PAYMENT_METHOD",
              info.row.original.paymentMethodId,
              i18n.language,
            ) ||
              info.getValue() ||
              t("cash")}
          </span>
        </div>
      ),
    },
    {
      header: tc("status"),
      accessorKey: "invoiceStatusName",
      cell: (info: any) => {
        const val = getLookupValue(
          "INVOICE_STATUS",
          info.row.original.invoiceStatusId,
          i18n.language,
        );
        return (
          <Badge
            variant={val === "Paid" || val === "مدفوع" ? "success" : "warning"}
          >
            {val || info.getValue() || t("pending")}
          </Badge>
        );
      },
    },
    {
      header: tc("actions"),
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-1">
          <Link to={`/sales/${info.row.original.oid}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600  p-0 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePrintRow(info.row.original)}
            className="text-gray-600  p-0 hover:bg-gray-100"
          >
            <Printer className="h-4 w-4" />
          </Button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("search_placeholder")}
        />
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span className="text-gray-400">{tc("to")}</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
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

      {/* Hidden printable invoice for row actions */}
      {selectedInvoice && (
        <PrintableInvoice ref={printRef} invoice={selectedInvoice} />
      )}
    </div>
  );
}
