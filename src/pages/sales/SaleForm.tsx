import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { productService } from "@/api/productService";
import { branchService } from "@/api/branchService";
import { stakeholderService } from "@/api/stakeholderService";
import { salesService } from "@/api/salesService";
import { lookupService } from "@/api/lookupService";
import { handleApiError } from "@/utils/handleApiError";
import {
  ProductDto,
  BranchDto,
  StakeholderDto,
  AppLookupDetailDto,
  CreateSalesInvoiceDto,
  FilterOperation,
  FilterRequest,
} from "@/types";

import SaleGeneralInfo from "./form-components/SaleGeneralInfo";
import ProductSearch from "./form-components/ProductSearch";
import CartItemTable from "./form-components/CartItemTable";
import OrderSummary from "./form-components/OrderSummary";

interface CartItem {
  product: ProductDto;
  quantity: number;
  unitPrice: number;
}

export default function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation("sales");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [customers, setCustomers] = useState<StakeholderDto[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<AppLookupDetailDto[]>(
    [],
  );

  const [search, setSearch] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initial Fetch: Branches, Stakeholders, Payment Methods
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsDataLoading(true);
      try {
        const bRes = await branchService.query({
          request: {
            filters: [],
            sort: [],
            pagination: { pageNumber: 1, pageSize: 50 },
          },
        });
        setBranches(bRes.data.data?.data || []);

        const cRes = await stakeholderService.query({
          request: {
            filters: [
              new FilterRequest(
                "stakeholderTypeCode",
                "CUSTOMER",
                FilterOperation.Equals,
              ),
            ],
            sort: [],
            pagination: { pageNumber: 1, pageSize: 50 },
          },
        });
        setCustomers(cRes.data.data?.data || []);

        const lRes = await lookupService.getByCode("PAYMENT_METHOD");
        setPaymentMethods(lRes.data.data?.lookupDetails || []);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Debounced Product Search
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

  // Debounced Branch Search
  const handleBranchSearch = useMemo(() => {
    let timer: any;
    return (val: string) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const res = await branchService.query({
            request: {
              filters: val.trim()
                ? [
                    new FilterRequest(
                      "branchName",
                      val,
                      FilterOperation.LessThan,
                    ),
                  ]
                : [],
              sort: [],
              pagination: { pageNumber: 1, pageSize: 50 },
            },
          });
          setBranches(res.data.data?.data || []);
        } catch (err) {
          console.error("Branch search failed", err);
        }
      }, 400);
    };
  }, []);

  // Debounced Customer Search
  const handleCustomerSearch = useMemo(() => {
    let timer: any;
    return (val: string) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const res = await stakeholderService.query({
            request: {
              filters: [
                new FilterRequest(
                  "stakeholderTypeCode",
                  "CUSTOMER",
                  FilterOperation.Contains,
                ),
                ...(val.trim()
                  ? [
                      new FilterRequest(
                        "fullName",
                        val,
                        FilterOperation.LessThan,
                      ),
                    ]
                  : []),
              ] as any,
              sort: [],
              pagination: { pageNumber: 1, pageSize: 50 },
            },
          });
          setCustomers(res.data.data?.data || []);
        } catch (err) {
          console.error("Customer search failed", err);
        }
      }, 400);
    };
  }, []);

  const addToCart = (product: ProductDto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.oid === product.oid);
      if (existing) {
        return prev.map((item) =>
          item.product.oid === product.oid
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.price || 0 }];
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

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.oid !== productId));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

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
        customerId: selectedCustomerId || undefined,
        invoiceDate: new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.product.oid,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxAmount: item.unitPrice * 0.15,
        })),
        totalAmount: totals.total,
        taxAmount: totals.tax,
        paymentMethodId: selectedPaymentMethodId || undefined,
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[70vh]">
      <div className="xl:col-span-2 space-y-6 min-w-0">
        <SaleGeneralInfo
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          branches={branches}
          customers={customers}
          handleBranchSearch={handleBranchSearch}
          handleCustomerSearch={handleCustomerSearch}
        />

        <ProductSearch
          search={search}
          setSearch={setSearch}
          isSearching={isSearching}
          filteredProducts={products}
          addToCart={addToCart}
        />

        <CartItemTable
          cart={cart}
          setCart={setCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      </div>

      <OrderSummary
        totals={totals}
        paymentMethods={paymentMethods}
        selectedPaymentMethodId={selectedPaymentMethodId}
        setSelectedPaymentMethodId={setSelectedPaymentMethodId}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        cartLength={cart.length}
      />
    </div>
  );
}
