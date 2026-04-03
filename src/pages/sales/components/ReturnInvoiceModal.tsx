import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  SalesInvoiceDto,
  AppLookupDetailDto,
  CreateReturnInvoiceDto,
  CreateReturnInvoiceItemDto,
} from "@/types";
import { returnInvoiceService } from "@/api/returnInvoiceService";
import { lookupService } from "@/api/lookupService";
import { handleApiError } from "@/utils/handleApiError";
import { useAuthStore } from "@/store/authStore";
import { Minus, Plus, AlertCircle } from "lucide-react";

interface ReturnInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SalesInvoiceDto;
  onSuccess: () => void;
}

export default function ReturnInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: ReturnInvoiceModalProps) {
  const { t } = useTranslation("sales");
  const tc = useTranslation("common").t;
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [returnReasons, setReturnReasons] = useState<AppLookupDetailDto[]>([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [notes, setNotes] = useState("");

  // State to track return quantity for each item
  // key is originalItemId, value is quantity to return
  const [returnQuantities, setReturnQuantities] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (isOpen) {
      // Initialize return quantities to 0
      const initialQtys: Record<string, number> = {};
      invoice.items?.forEach((item) => {
        initialQtys[item.oid] = 0;
      });
      setReturnQuantities(initialQtys);

      // Fetch return reasons
      const fetchReasons = async () => {
        try {
          const res = await lookupService.getByCode("RETURN_REASON");
          setReturnReasons(res.data.data?.lookupDetails || []);
          if (res.data.data?.lookupDetails?.length) {
            setSelectedReasonId(res.data.data.lookupDetails[0].oid);
          }
        } catch (err) {
          console.error("Failed to fetch return reasons", err);
        }
      };
      fetchReasons();
    }
  }, [isOpen, invoice]);

  const handleQtyChange = (itemId: string, val: number, max: number) => {
    const newQty = Math.max(0, Math.min(max, val));
    setReturnQuantities((prev) => ({ ...prev, [itemId]: newQty }));
  };

  const totalReturnAmount =
    invoice.items?.reduce((acc, item) => {
      const qty = returnQuantities[item.oid] || 0;
      return acc + qty * (item.unitPrice || 0);
    }, 0) || 0;

  const handleSubmit = async () => {
    const itemsToReturn = invoice.items?.filter(
      (item) => (returnQuantities[item.oid] || 0) > 0,
    );

    if (!itemsToReturn || itemsToReturn.length === 0) {
      toast.error(t("select_items_to_return"));
      return;
    }

    if (!selectedReasonId) {
      toast.error(t("return_reason_required"));
      return;
    }

    setIsLoading(true);
    try {
      const dto: CreateReturnInvoiceDto = {
        originalInvoiceId: invoice.oid,
        branchId: invoice.branchId || user?.branchId || "",
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        discountPercent: 0, // Should probably be calculated or defined by business logic
        returnDate: new Date().toISOString(),
        paymentMethodId: invoice.paymentMethodId || "",
        cashierId: user?.oid || "",
        returnReasonId: selectedReasonId,
        notes: notes,
        items: itemsToReturn.map((item) => ({
          originalInvoiceItemId: item.oid,
          productId: item.productId,
          quantity: returnQuantities[item.oid],
          unitPrice: item.unitPrice,
          discountPercent: 0,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          notes: "",
        })),
      };

      await returnInvoiceService.create(dto);
      toast.success(t("return_created_success"));
      onSuccess();
      onClose();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("return_items")}
      size="2xl"
    >
      <div className="space-y-6">
        {/* Invoice Info Summary */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center text-sm">
          <div>
            <span className="text-gray-500">{t("invoice_number")}: </span>
            <span className="font-bold text-gray-900">
              #{invoice.invoiceNumber}
            </span>
          </div>
          <div>
            <span className="text-gray-500">{t("total_amount")}: </span>
            <span className="font-bold text-gray-900">
              ${invoice.totalAmount?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Item Selection Table */}
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="px-4 py-3 text-left">{t("product")}</th>
                <th className="px-4 py-3 text-center">{t("purchased_qty")}</th>
                <th className="px-4 py-3 text-center w-32">
                  {t("return_qty")}
                </th>
                <th className="px-4 py-3 text-right">{t("subtotal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.items?.map((item) => (
                <tr
                  key={item.oid}
                  className={
                    returnQuantities[item.oid] > 0 ? "bg-blue-50/30" : ""
                  }
                >
                  <td className="px-4 py-4">
                    <p className="font-bold text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {item.batchNumber}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-gray-600">
                    {item.remainingQuantity}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() =>
                          handleQtyChange(
                            item.oid,
                            (returnQuantities[item.oid] || 0) - 1,
                            item.remainingQuantity,
                          )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
                        title="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={item.remainingQuantity}
                        value={returnQuantities[item.oid] || 0}
                        onChange={(e) =>
                          handleQtyChange(
                            item.oid,
                            parseInt(e.target.value) || 0,
                            item.remainingQuantity,
                          )
                        }
                        className="w-12 text-center bg-transparent font-bold text-gray-900 border-none focus:ring-0 p-0"
                      />
                      <button
                        onClick={() =>
                          handleQtyChange(
                            item.oid,
                            (returnQuantities[item.oid] || 0) + 1,
                            item.remainingQuantity,
                          )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
                        title="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-gray-900">
                    $
                    {(
                      (returnQuantities[item.oid] || 0) * (item.unitPrice || 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Refund Form Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              {t("return_reason")}
            </label>
            <select
              value={selectedReasonId}
              onChange={(e) => setSelectedReasonId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            >
              <option value="">{t("select_reason")}</option>
              {returnReasons.map((reason) => (
                <option key={reason.oid} value={reason.oid}>
                  {reason.valueNameEn || reason.valueNameAr}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              {t("notes")}
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("return_notes_placeholder")}
              className="h-[42px]"
            />
          </div>
        </div>

        {/* Total Summary & Warning */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              {t("refund_warning_msg")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">
              {t("refund_amount")}
            </p>
            <p className="text-3xl font-black text-amber-900 tracking-tighter">
              ${totalReturnAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {tc("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="flex-[2] shadow-lg shadow-primary-600/20"
            disabled={totalReturnAmount === 0}
          >
            {t("process_refund")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
