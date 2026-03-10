import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { productService } from "@/api/productService";
import { branchService } from "@/api/branchService";
import { salesService } from "@/api/salesService";
import { lookupService } from "@/api/lookupService";
import { handleApiError } from "@/utils/handleApiError";
import {
  ProductDto,
  BranchDto,
  AppLookupDetailDto,
  CreateSalesInvoiceDto,
  FilterOperation,
  FilterRequest,
} from "@/types";

import SaleGeneralInfo from "./form-components/SaleGeneralInfo";
import ProductSearch from "./form-components/ProductSearch";
import CartItemTable from "./form-components/CartItemTable";
import OrderSummary from "./form-components/OrderSummary";

export interface CartItem {
  product: ProductDto;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  batchNumber: string;
  serialNumber: string;
  expiryDate: string;
  notes: string;
}

export default function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation("sales");
  const BRANCHES_PAGE_SIZE = 20;

  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductDto[]>([]);

  // Branches — paginated
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [branchesPage, setBranchesPage] = useState(1);
  const [branchesHasMore, setBranchesHasMore] = useState(false);
  const [isLoadingMoreBranches, setIsLoadingMoreBranches] = useState(false);
  const currentBranchSearchRef = useRef<string>("");

  const [paymentMethods, setPaymentMethods] = useState<AppLookupDetailDto[]>(
    [],
  );

  // Search states
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // General info
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [prescriptionNumber, setPrescriptionNumber] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");

  // Payment
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // ── Paginated branch fetch ──────────────────────────────────────────────
  const fetchBranches = useCallback(
    async (search: string, page: number, replace: boolean) => {
      setIsLoadingMoreBranches(true);
      try {
        const res = await branchService.query({
          request: {
            filters: search.trim()
              ? [
                  new FilterRequest(
                    "branchName",
                    search,
                    FilterOperation.Contains,
                  ),
                ]
              : [],
            sort: [],
            pagination: { pageNumber: page, pageSize: BRANCHES_PAGE_SIZE },
          },
        });
        const fetched = res.data.data?.data || [];
        const hasNext = res.data.data?.hasNextPage ?? false;
        setBranches((prev) =>
          replace
            ? fetched
            : [
                ...prev,
                ...fetched.filter((f) => !prev.find((p) => p.oid === f.oid)),
              ],
        );
        setBranchesHasMore(hasNext);
        setBranchesPage(page);
      } catch (err) {
        console.error("Branch fetch failed", err);
      } finally {
        setIsLoadingMoreBranches(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [],
  );

  // Initial Fetch: Branches, Payment Methods
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsDataLoading(true);
      try {
        await fetchBranches("", 1, true);

        const lRes = await lookupService.getByCode("PAYMENT_METHOD");
        const methods = lRes.data.data?.lookupDetails || [];
        setPaymentMethods(methods);

        // Default to Cash
        const cashMethod = methods.find(
          (m) =>
            m.lookupDetailCode?.toLowerCase() === "cash" ||
            m.valueNameEn?.toLowerCase() === "cash",
        );
        if (cashMethod) {
          setSelectedPaymentMethodId(cashMethod.oid);
        } else if (methods.length > 0) {
          setSelectedPaymentMethodId(methods[0].oid);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Debounced Product Search by name
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setProducts([]);
        return;
      }

      setIsSearching(true);
      try {
        const pRes = await productService.query({
          request: {
            filters: [
              new FilterRequest("drugName", search, FilterOperation.Contains),
            ],
            sort: [],
            pagination: { pageNumber: 1, pageSize: 10 },
          },
        });
        setProducts(pRes.data.data?.data || []);
      } catch (err) {
        console.error("Failed to search products", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Debounced Branch Search (resets to page 1)
  const handleBranchSearch = useMemo(() => {
    let timer: any;
    return (val: string) => {
      currentBranchSearchRef.current = val;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fetchBranches(val, 1, true);
      }, 400);
    };
  }, [fetchBranches]);

  // Load next page of branches
  const handleLoadMoreBranches = useCallback(() => {
    if (!branchesHasMore || isLoadingMoreBranches) return;
    fetchBranches(currentBranchSearchRef.current, branchesPage + 1, false);
  }, [fetchBranches, branchesHasMore, isLoadingMoreBranches, branchesPage]);

  // QR/Barcode scan handler
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
            serialNumber: barcodeData?.serialNumber || "",
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

  const addToCart = (
    product: ProductDto,
    extra?: {
      batchNumber?: string;
      serialNumber?: string;
      expiryDate?: string;
    },
  ) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.oid === product.oid);
      if (existing) {
        return prev.map((item) =>
          item.product.oid === product.oid
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.price || 0,
          discountPercent: 0,
          batchNumber: extra?.batchNumber || "",
          serialNumber: extra?.serialNumber || "",
          expiryDate: extra?.expiryDate || "",
          notes: "",
        },
      ];
    });
    setSearch("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.oid === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const updateCartItem = (
    productId: string,
    field: keyof CartItem,
    value: any,
  ) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.oid === productId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.oid !== productId));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineDiscount = lineTotal * (item.discountPercent / 100);
      return acc + (lineTotal - lineDiscount);
    }, 0);
    const overallDiscount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - overallDiscount;
    const tax = afterDiscount * 0.15;
    const total = afterDiscount + tax;
    return { subtotal, tax, total, overallDiscount };
  }, [cart, discountPercent]);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error(t("cart_empty"));
      return;
    }
    if (!selectedBranchId) {
      toast.error(t("branch_required"));
      return;
    }

    setIsLoading(true);
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
        items: cart.map((item) => ({
          productId: item.product.oid,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || undefined,
          batchNumber: item.batchNumber || undefined,
          serialNumber: item.serialNumber || undefined,
          expiryDate: item.expiryDate
            ? new Date(item.expiryDate).toISOString()
            : undefined,
          notes: item.notes || undefined,
        })),
      };

      await salesService.create(dto);
      toast.success(t("sale_success"));
      setCart([]);
      onSuccess();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[70vh]">
      <div className="xl:col-span-2 space-y-5 min-w-0">
        <ProductSearch
          search={search}
          setSearch={setSearch}
          isSearching={isSearching}
          filteredProducts={products}
          addToCart={addToCart}
          onBarcodeScan={handleBarcodeScan}
          barcodeInputRef={barcodeInputRef}
        />
        <CartItemTable
          cart={cart}
          setCart={setCart}
          updateQuantity={updateQuantity}
          updateCartItem={updateCartItem}
          removeFromCart={removeFromCart}
        />
        <SaleGeneralInfo
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          prescriptionNumber={prescriptionNumber}
          setPrescriptionNumber={setPrescriptionNumber}
          doctorName={doctorName}
          setDoctorName={setDoctorName}
          notes={notes}
          setNotes={setNotes}
          branches={branches}
          handleBranchSearch={handleBranchSearch}
          onLoadMoreBranches={handleLoadMoreBranches}
          branchesHasMore={branchesHasMore}
          isLoadingMoreBranches={isLoadingMoreBranches}
        />
      </div>

      <OrderSummary
        totals={totals}
        paymentMethods={paymentMethods}
        selectedPaymentMethodId={selectedPaymentMethodId}
        setSelectedPaymentMethodId={setSelectedPaymentMethodId}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        cartLength={cart.length}
      />
    </div>
  );
}
