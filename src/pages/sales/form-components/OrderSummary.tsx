import { Calculator } from "lucide-react";
import { useTranslation } from "react-i18next";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { AppLookupDetailDto } from "@/types";

interface OrderSummaryProps {
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  paymentMethods: AppLookupDetailDto[];
  selectedPaymentMethodId: string;
  setSelectedPaymentMethodId: (id: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  cartLength: number;
}

export default function OrderSummary({
  totals,
  paymentMethods,
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
  handleSubmit,
  isLoading,
  cartLength,
}: OrderSummaryProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-0 space-y-6">
      <h3 className="font-bold text-gray-700">{t("order_summary")}</h3>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>{t("subtotal")}</span>
            <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span>{t("vat")} (15%)</span>
            <span className="font-medium">${totals.tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
            <span className="font-bold text-gray-900">{t("total_amount")}</span>
            <span className="font-bold text-blue-600 text-2xl tracking-tighter">
              ${totals.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        <div className="space-y-4">
          <Select
            label={t("payment_method")}
            value={selectedPaymentMethodId}
            onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
            options={paymentMethods.map((pm) => ({
              value: pm.oid,
              label: pm.valueNameEn ?? "",
            }))}
          />

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <Calculator className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-bold mb-1">{t("pos_calculation")}</p>
              <p>{t("pos_calculation_msg")}</p>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-200"
            disabled={cartLength === 0 || isLoading}
            isLoading={isLoading}
          >
            {t("complete_transaction")}
          </Button>
        </div>
      </div>
    </div>
  );
}
