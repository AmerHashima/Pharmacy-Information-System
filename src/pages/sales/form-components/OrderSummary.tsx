import { useTranslation } from "react-i18next";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { AppLookupDetailDto } from "@/types";

interface OrderSummaryProps {
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    overallDiscount: number;
  };
  paymentMethods: AppLookupDetailDto[];
  selectedPaymentMethodId: string;
  setSelectedPaymentMethodId: (id: string) => void;
  discountPercent: number;
  setDiscountPercent: (val: number) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  cartLength: number;
}

export default function OrderSummary({
  totals,
  paymentMethods,
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
  discountPercent,
  setDiscountPercent,
  handleSubmit,
  isLoading,
  cartLength,
}: OrderSummaryProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      {/* Total Amount at top */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700">
          {t("order_summary")}
          <span className="text-xs font-normal text-gray-500 ml-2">Prices include VAT</span>
        </h3>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">{t("totalAmount")}</p>
          <span className="font-bold text-blue-600 text-2xl tracking-tighter">
            {totals.total.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {/* Discount, VAT and Payment Method in same row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">{t("discount")}</p>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) =>
                setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))
              }
              className="w-full text-center font-semibold text-red-500 bg-transparent border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {discountPercent > 0 ? `${discountPercent.toFixed(2)}%` : "0%"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">{t("vat")}</p>
            <p className="font-semibold text-gray-900">
              {totals.tax.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-400">(15%)</p>
          </div>
          <Select
            label={t("paymentMethod")}
            value={selectedPaymentMethodId}
            onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
            options={paymentMethods.map((pm) => ({
              value: pm.oid,
              label: pm.valueNameEn ?? "",
            }))}
          />
        </div>

        {/* Submit Button */}
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
  );
}
