import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { returnInvoiceService } from "@/api/returnInvoiceService";
import { ReturnInvoiceDto } from "@/types";
import { handleApiError } from "@/utils/handleApiError";

import SaleDetailLoading from "./components/detail-page/SaleDetailLoading";
import SaleDetailNotFound from "./components/detail-page/SaleDetailNotFound";
import RefundDetailHeader from "./components/detail-page/RefundDetailHeader";
import RefundDocument from "./components/detail-page/RefundDocument";
import PrintableRefund from "./components/detail-page/PrintableRefund";
import RefundSidebar from "./components/detail-page/RefundSidebar";

export default function RefundDetailPage() {
  const { id } = useParams();
  const [refundData, setRefundData] = useState<ReturnInvoiceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // References for printing
  const componentRef = useRef<HTMLDivElement>(null);
  const printComponentRef = useRef<HTMLDivElement>(null);

  // Note: We might need a specialized PrintableRefund component
  // but for now let's see if we can use the same logic if it fits.
  // The user specifically asked for "style of this invoice" for the print.
  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Refund_${refundData?.returnNumber || id}`,
  });

  const fetchRefund = useCallback(async () => {
    if (!id) return;
    try {
      const res = await returnInvoiceService.getById(id);
      setRefundData(res.data.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRefund();
  }, [fetchRefund]);

  if (isLoading) {
    return <SaleDetailLoading />;
  }

  if (!refundData) {
    return <SaleDetailNotFound />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <RefundDetailHeader onPrint={() => handlePrint()} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <RefundDocument ref={componentRef} refund={refundData} />
        </div>

        <RefundSidebar refund={refundData} />
      </div>

      {/* Hidden printable refund receipt */}
      <PrintableRefund ref={printComponentRef} refund={refundData} />
    </div>
  );
}
