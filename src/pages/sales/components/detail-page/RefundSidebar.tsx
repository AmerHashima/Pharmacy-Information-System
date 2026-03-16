import { CreditCard, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";
import { ReturnInvoiceDto } from "@/types";

interface RefundSidebarProps {
  refund: ReturnInvoiceDto;
}

export default function RefundSidebar({ refund }: RefundSidebarProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="space-y-6 print:hidden">
      <Card
        title={t("refund_payment_details", {
          defaultValue: "Refund Payment Details",
        })}
        className="border border-gray-100 shadow-md shadow-gray-100/50 bg-white"
      >
        <div className="space-y-6 p-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Refund Method
            </span>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <CreditCard className="h-5 w-5 text-slate-600" />
              </div>
              <span className="font-bold text-gray-800">
                {refund.paymentMethodName || t("cash")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Refund Reason
            </span>
            <div className="flex items-center gap-3 bg-red-50 text-red-700 p-3 rounded-xl border border-red-100">
              <div className="p-2 bg-red-100 rounded-lg">
                <Info className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <span className="font-bold block">
                  {refund.returnReasonName || "Generic Return"}
                </span>
                {refund.notes && (
                  <span className="text-xs opacity-80 block truncate max-w-[200px]">
                    {refund.notes}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
