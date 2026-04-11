import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { productService } from "@/api/productService";
import { salesService } from "@/api/salesService";
import { lookupService } from "@/api/lookupService";
import { handleApiError } from "@/utils/handleApiError";
import { usePaginatedBranches, usePaginatedProducts } from "@/hooks/queries";
import { AppLookupDetailDto, CreateSalesInvoiceDto, ProductDto } from "@/types";
import { useCart, type CartItem } from "./useCart";

export function useSaleForm(onSuccess: () => void) {
  const { t } = useTranslation("sales");

  // ── Products — paginated ──────────────────────────────────────────
  const {
    options: products,
    setSearch: handleProductSearch,
    loadMore: handleLoadMoreProducts,
    hasMore: productsHasMore,
    isLoadingMore: isLoadingMoreProducts,
  } = usePaginatedProducts();

  // ── Branches — paginated ──────────────────────────────────────────
  const {
    options: branches,
    setSearch: handleBranchSearch,
    loadMore: handleLoadMoreBranches,
    hasMore: branchesHasMore,
    isLoadingMore: isLoadingMoreBranches,
  } = usePaginatedBranches();

  // ── General info ──────────────────────────────────────────────────
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [prescriptionNumber, setPrescriptionNumber] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");

  // ── Payment ───────────────────────────────────────────────────────
  const [paymentMethods, setPaymentMethods] = useState<AppLookupDetailDto[]>(
    [],
  );
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");

  // ── Cart (delegated to useCart hook) ──────────────────────────────
  const {
    cart,
    setCart,
    addToCart,
    updateQuantity,
    updateCartItem,
    removeFromCart,
    clearCart,
    totals,
  } = useCart(discountPercent);

  // ── Barcode ───────────────────────────────────────────────────────
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Payment methods (lookup — runs once) ──────────────────────────
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const lRes = await lookupService.getByCode("PAYMENT_METHOD");
        const methods = lRes.data.data?.lookupDetails || [];
        setPaymentMethods(methods);
        const cashMethod = methods.find(
          (m) =>
            m.lookupDetailCode?.toLowerCase() === "cash" ||
            m.valueNameEn?.toLowerCase() === "cash",
        );
        if (cashMethod) setSelectedPaymentMethodId(cashMethod.oid);
        else if (methods.length > 0) setSelectedPaymentMethodId(methods[0].oid);
      } catch (err) {
        console.error("Failed to fetch payment methods", err);
      }
    };
    fetchPaymentMethods();
  }, []);

  // ── Barcode scan handler ──────────────────────────────────────────
  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode.trim()) return;
    try {
      const res = await productService.parseAndGetProduct({
        barcodeInput: barcode,
      });
      if (res.data.success && res.data.data?.productFound) {
        const prod = res.data.data.product;
        const barcodeData = res.data.data.barcodeData;

        if (prod) {
          addToCart(prod, {
            batchNumber: barcodeData?.batchNumber || "",
            serialNumbers: barcodeData?.serialNumber
              ? [barcodeData.serialNumber]
              : [],
            expiryDate: barcodeData?.expiryDate
              ? new Date(barcodeData.expiryDate).toISOString().split("T")[0]
              : "",
          });
          toast.success(t("productFound"));
        }
      } else {
        toast.error(res.data.data?.productMessage || t("productNotFound"));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("productNotFound"));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error(t("cart_empty"));
      return;
    }
    if (!selectedBranchId) {
      toast.error(t("branch_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateSalesInvoiceDto = {
        branchId: selectedBranchId,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        discountPercent: discountPercent || undefined,
        invoiceDate: new Date().toISOString(),
        paymentMethodId: selectedPaymentMethodId || undefined,
        prescriptionNumber: prescriptionNumber || undefined,
        doctorName: doctorName || undefined,
        notes: notes || undefined,
        items: cart.flatMap((item) => {
          if (item.serialNumbers && item.serialNumbers.length > 0) {
            const serializedItems = item.serialNumbers.map((sn) => ({
              productId: item.product.oid,
              quantity: 1,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent || undefined,
              batchNumber: item.batchNumber || undefined,
              serialNumber: sn || undefined,
              expiryDate: item.expiryDate
                ? new Date(item.expiryDate).toISOString()
                : undefined,
              notes: item.notes || undefined,
            }));

            if (item.quantity > item.serialNumbers.length) {
              serializedItems.push({
                productId: item.product.oid,
                quantity: item.quantity - item.serialNumbers.length,
                unitPrice: item.unitPrice,
                discountPercent: item.discountPercent || undefined,
                batchNumber: item.batchNumber || undefined,
                serialNumber: undefined,
                expiryDate: item.expiryDate
                  ? new Date(item.expiryDate).toISOString()
                  : undefined,
                notes: item.notes || undefined,
              });
            }
            return serializedItems;
          }

          return [
            {
              productId: item.product.oid,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent || undefined,
              batchNumber: item.batchNumber || undefined,
              serialNumber: undefined,
              expiryDate: item.expiryDate
                ? new Date(item.expiryDate).toISOString()
                : undefined,
              notes: item.notes || undefined,
            },
          ];
        }),
      };

      await salesService.create(dto);
      toast.success(t("sale_success"));
      clearCart();
      onSuccess();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Products
    products,
    handleProductSearch,
    handleLoadMoreProducts,
    productsHasMore,
    isLoadingMoreProducts,

    // Branches
    branches,
    handleBranchSearch,
    handleLoadMoreBranches,
    branchesHasMore,
    isLoadingMoreBranches,

    // General info
    selectedBranchId,
    setSelectedBranchId,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerEmail,
    setCustomerEmail,
    discountPercent,
    setDiscountPercent,
    prescriptionNumber,
    setPrescriptionNumber,
    doctorName,
    setDoctorName,
    notes,
    setNotes,

    // Payment
    paymentMethods,
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,

    // Cart
    cart,
    setCart,
    addToCart,
    updateQuantity,
    updateCartItem,
    removeFromCart,
    totals,

    // Barcode
    barcodeInputRef,
    handleBarcodeScan,

    // Submit
    isSubmitting,
    handleSubmit,
  };
}
