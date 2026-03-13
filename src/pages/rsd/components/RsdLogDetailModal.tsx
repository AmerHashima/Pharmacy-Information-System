import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Info, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { rsdService } from "@/api/rsdService";
import { RsdOperationLogDetailDto } from "@/types";
import Spinner from "@/components/ui/Spinner";

interface RsdLogDetailModalProps {
  logId: string;
  onClose: () => void;
}

export default function RsdLogDetailModal({
  logId,
  onClose,
}: RsdLogDetailModalProps) {
  const { t } = useTranslation("rsd");
  const [log, setLog] = useState<RsdOperationLogDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      setIsLoading(true);
      try {
        const res = await rsdService.getOperationLog(logId);
        if (res.data.success) {
          setLog(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch RSD log detail", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [logId]);

  const detailColumns = [
    {
      header: t("gtin"),
      accessorKey: "gtin",
      cell: (info: any) => (
        <span className="font-mono text-xs">{info.getValue() || "---"}</span>
      ),
    },
    {
      header: t("productName"),
      accessorKey: "productName",
      cell: (info: any) => (
        <span className="font-medium">{info.getValue() || "---"}</span>
      ),
    },
    {
      header: t("quantity"),
      accessorKey: "quantity",
      cell: (info: any) => <span className="font-bold">{info.getValue()}</span>,
    },
    {
      header: t("batch"),
      accessorKey: "batchNumber",
      cell: (info: any) => (
        <span className="text-xs">{info.getValue() || "---"}</span>
      ),
    },
    {
      header: t("expiry"),
      accessorKey: "expiryDate",
      cell: (info: any) => (
        <span className="text-xs font-mono">
          {info.getValue()
            ? format(new Date(info.getValue()), "yyyy-MM-dd")
            : "---"}
        </span>
      ),
    },
    {
      header: t("respCode"),
      accessorKey: "responseCode",
      cell: (info: any) => (
        <Badge
          variant={info.getValue() === "0" ? "success" : "danger"}
          className="text-[10px]"
        >
          {info.getValue() || "---"}
        </Badge>
      ),
    },
  ];

  return (
    <Modal
      isOpen={!!logId}
      onClose={onClose}
      title={t("logDetails")}
      size="full"
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : log ? (
        <div className="space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Info className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t("operationType")}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {log.operationTypeName}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Package className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t("notificationId")}
                </span>
              </div>
              <p className="text-sm font-mono font-bold text-blue-600">
                {log.notificationId}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t("success")}
                </span>
              </div>
              <Badge variant={log.success ? "success" : "danger"}>
                {log.success ? t("statusSuccess") : t("statusFailed")}
              </Badge>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Info className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t("requestedAt")}
                </span>
              </div>
              <p className="text-sm font-mono text-gray-600">
                {format(new Date(log.requestedAt), "yyyy-MM-dd HH:mm:ss")}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
              {t("message")}
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {log.responseMessage}
            </p>
          </div>

          {/* Products Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-gray-900">
                {t("productsProcessed")}
              </h4>
              <Badge variant="default" className="px-3">
                {log.details.length} {t("quantity")}
              </Badge>
            </div>
            <Table
              columns={detailColumns}
              data={log.details}
              isLoading={false}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Failed to load log details.
        </div>
      )}
    </Modal>
  );
}
