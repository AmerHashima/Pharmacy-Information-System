import { useTranslation } from "react-i18next";
import { ReturnInvoiceDto } from "@/types";

interface RefundItemsTableProps {
  refund: ReturnInvoiceDto;
}

export default function RefundItemsTable({ refund }: RefundItemsTableProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/80 text-gray-500 font-medium uppercase text-xs tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">{t("product")}</th>
              <th className="px-6 py-4 text-center">{t("qty")}</th>
              <th className="px-6 py-4 text-right">{t("unit_price")}</th>
              <th className="px-6 py-4 text-right">{t("total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {refund.items?.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {item.productName}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {item.batchNumber && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                        {t("batch")}: {item.batchNumber}
                      </span>
                    )}
                    {item.productGTIN && (
                      <span className="text-gray-400">
                        GTIN: {item.productGTIN}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-medium text-gray-700">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-600">
                  ${item.unitPrice?.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  ${item.totalPrice?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50/50 p-6 md:p-8 flex flex-col items-end border-t border-gray-100">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t("subtotal")}</span>
            <span className="font-semibold text-gray-900">
              ${refund.subTotal?.toFixed(2)}
            </span>
          </div>
          {refund.taxAmount ? (
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t("vat")}</span>
              <span className="font-semibold text-gray-900">
                ${refund.taxAmount.toFixed(2)}
              </span>
            </div>
          ) : null}

          <div className="pt-4 border-t border-gray-200 border-dashed">
            <div className="flex justify-between items-end">
              <span className="font-bold text-gray-900 text-lg">
                {t("refund_amount", { defaultValue: "Refund Amount" })}
              </span>
              <span className="text-3xl font-black text-red-600 tracking-tight">
                ${refund.refundAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
