import { useSaleForm, usePrescriptionAnalysis } from "./hooks";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { SalesInvoiceDto } from "@/types";

import SaleGeneralInfo from "./form-components/SaleGeneralInfo";
import CartItemTable from "./form-components/CartItemTable";
import OrderSummary from "./form-components/OrderSummary";
import AnalyzingBanner from "./form-components/AnalyzingBanner";
import { PrescriptionAnalysisModal } from "./form-components/prescription";
import PrintableInvoice from "./components/detail-page/PrintableInvoice";

export type { CartItem } from "./hooks";

export default function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const sale = useSaleForm(onSuccess);
  const [invoiceToPrint, setInvoiceToPrint] = useState<SalesInvoiceDto | null>(
    null,
  );
  const printRef = useRef<HTMLDivElement>(null);

  const rx = usePrescriptionAnalysis({ addToCart: sale.addToCart });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoiceToPrint?.invoiceNumber || "Sale"}`,
  });

  const handleCompleteTransaction = async () => {
    const createdInvoice = await sale.handleSubmit();
    if (!createdInvoice) return;

    setInvoiceToPrint(createdInvoice);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  return (
    <div className="space-y-6">

      {/* ── Analyzing Overlay Banner ── */}
      {rx.isAnalyzing && <AnalyzingBanner />}

      {/* ── Section 1: Order Summary + General Information (Side by Side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: General Information (takes 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <SaleGeneralInfo
            selectedBranchId={sale.selectedBranchId}
            setSelectedBranchId={sale.setSelectedBranchId}
            customerName={sale.customerName}
            setCustomerName={sale.setCustomerName}
            customerPhone={sale.customerPhone}
            setCustomerPhone={sale.setCustomerPhone}
            customerEmail={sale.customerEmail}
            setCustomerEmail={sale.setCustomerEmail}
            prescriptionNumber={sale.prescriptionNumber}
            setPrescriptionNumber={sale.setPrescriptionNumber}
            doctorName={sale.doctorName}
            setDoctorName={sale.setDoctorName}
            notes={sale.notes}
            setNotes={sale.setNotes}
            branches={sale.branches}
            handleBranchSearch={sale.handleBranchSearch}
            onLoadMoreBranches={sale.handleLoadMoreBranches}
            branchesHasMore={sale.branchesHasMore}
            isLoadingMoreBranches={sale.isLoadingMoreBranches}
          />
        </div>

        {/* Right: Order Summary (takes 1 column on large screens) */}
        <div className="lg:col-span-1">
          {/* <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full"> */}
          <OrderSummary
            totals={sale.totals}
            paymentMethods={sale.paymentMethods}
            selectedPaymentMethodId={sale.selectedPaymentMethodId}
            setSelectedPaymentMethodId={sale.setSelectedPaymentMethodId}
            discountPercent={sale.discountPercent}
            setDiscountPercent={sale.setDiscountPercent}
            handleSubmit={handleCompleteTransaction}
            isLoading={sale.isSubmitting}
            cartLength={sale.cart.length}
          />
        </div>
        {/* </div> */}
      </div>

      {/* ── Section 2: Cart (Full Width) ── */}
      <CartItemTable
        cart={sale.cart}
        setCart={sale.setCart}
        updateQuantity={sale.updateQuantity}
        updateCartItem={sale.updateCartItem}
        removeFromCart={sale.removeFromCart}
        selectedBranchId={sale.selectedBranchId}
        // Search & AI Rx Props
        products={sale.products}
        onProductSearchChange={sale.handleProductSearch}
        onLoadMoreProducts={sale.handleLoadMoreProducts}
        productsHasMore={sale.productsHasMore}
        isLoadingMoreProducts={sale.isLoadingMoreProducts}
        addToCart={sale.addToCart}
        onBarcodeScan={sale.handleBarcodeScan}
        barcodeInputRef={sale.barcodeInputRef}
        isAnalyzingRx={rx.isAnalyzing}
        prescriptionInputRef={rx.prescriptionInputRef}
        onPrescriptionUpload={rx.handlePrescriptionUpload}
        onAiRxClick={rx.openFilePicker}
      />

      {/* ── AI Prescription Analysis Modal ── */}

      {/* ── AI Prescription Analysis Modal ── */}
      {rx.analysisResult && (
        <PrescriptionAnalysisModal
          isOpen={rx.showAnalysisModal}
          onClose={rx.closeModal}
          analysisResult={rx.analysisResult}
          onConfirm={rx.handlePrescriptionConfirm}
        />
      )}

      {/* Hidden printable invoice for auto print after successful transaction */}
      {invoiceToPrint && <PrintableInvoice ref={printRef} invoice={invoiceToPrint} />}
    </div>
  );
}
