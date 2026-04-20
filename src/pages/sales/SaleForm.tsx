import { useSaleForm, usePrescriptionAnalysis } from "./hooks";

import SaleGeneralInfo from "./form-components/SaleGeneralInfo";
import CartItemTable from "./form-components/CartItemTable";
import OrderSummary from "./form-components/OrderSummary";
import AnalyzingBanner from "./form-components/AnalyzingBanner";
import { PrescriptionAnalysisModal } from "./form-components/prescription";

export type { CartItem } from "./hooks";

export default function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const sale = useSaleForm(onSuccess);

  const rx = usePrescriptionAnalysis({ addToCart: sale.addToCart });

  return (
    <div className="space-y-5">

      {/* ── Analyzing Overlay Banner ── */}
      {rx.isAnalyzing && <AnalyzingBanner />}

      {/* ── Section 1: Top Area (Cart + Summary) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Cart items table + General Information */}
        <div className="xl:col-span-2 flex flex-col gap-5 min-w-0">
          <CartItemTable
            cart={sale.cart}
            setCart={sale.setCart}
            updateQuantity={sale.updateQuantity}
            updateCartItem={sale.updateCartItem}
            removeFromCart={sale.removeFromCart}
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

        {/* Right Column: Order Summary */}
        <OrderSummary
          totals={sale.totals}
          paymentMethods={sale.paymentMethods}
          selectedPaymentMethodId={sale.selectedPaymentMethodId}
          setSelectedPaymentMethodId={sale.setSelectedPaymentMethodId}
          discountPercent={sale.discountPercent}
          setDiscountPercent={sale.setDiscountPercent}
          handleSubmit={sale.handleSubmit}
          isLoading={sale.isSubmitting}
          cartLength={sale.cart.length}
        />
      </div>

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
    </div>
  );
}
