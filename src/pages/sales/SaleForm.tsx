import { useSaleForm, usePrescriptionAnalysis } from "./hooks";

import SaleGeneralInfo from "./form-components/SaleGeneralInfo";
import ProductSearch from "./form-components/ProductSearch";
import CartItemTable from "./form-components/CartItemTable";
import OrderSummary from "./form-components/OrderSummary";
import AiPrescriptionButton from "./form-components/AiPrescriptionButton";
import AnalyzingBanner from "./form-components/AnalyzingBanner";
import { PrescriptionAnalysisModal } from "./form-components/prescription";

export type { CartItem } from "./hooks";

export default function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const sale = useSaleForm(onSuccess);

  const rx = usePrescriptionAnalysis({ addToCart: sale.addToCart });

  return (
    <div className="space-y-5">
      {/* ── Row 1: Product Search + AI Button (full width) ── */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <ProductSearch
            products={sale.products}
            onSearchChange={sale.handleProductSearch}
            onLoadMore={sale.handleLoadMoreProducts}
            hasMore={sale.productsHasMore}
            isLoadingMore={sale.isLoadingMoreProducts}
            addToCart={sale.addToCart}
            onBarcodeScan={sale.handleBarcodeScan}
            barcodeInputRef={sale.barcodeInputRef}
          />
        </div>

        <AiPrescriptionButton
          isAnalyzing={rx.isAnalyzing}
          prescriptionInputRef={rx.prescriptionInputRef}
          onUpload={rx.handlePrescriptionUpload}
          onClickTrigger={rx.openFilePicker}
        />
      </div>

      {/* ── Analyzing Overlay Banner ── */}
      {rx.isAnalyzing && <AnalyzingBanner />}

      {/* ── Row 2: Cart Items (full width) ── */}
      <CartItemTable
        cart={sale.cart}
        setCart={sale.setCart}
        updateQuantity={sale.updateQuantity}
        updateCartItem={sale.updateCartItem}
        removeFromCart={sale.removeFromCart}
      />

      {/* ── Row 3: General Info + Order Summary (side by side) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-w-0">
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
