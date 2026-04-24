import { useState, useMemo, useCallback } from "react";
import { ProductDto } from "@/types";

const ZERO_RATED_VAT_TYPE_ID = "22222222-2222-2222-2222-2222222220c1";

export interface CartItem {
  product: ProductDto;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  batchNumber: string;
  serialNumbers: string[];
  expiryDate: string;
  notes: string;
  availableQuantity: number;
}

export function useCart(discountPercent: number) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback(
    (
      product: ProductDto,
      extra?: {
        batchNumber?: string;
        serialNumbers?: string[];
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
            serialNumbers: extra?.serialNumbers || [],
            expiryDate: extra?.expiryDate || "",
            notes: "",
            availableQuantity: 0,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.oid === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          // Don't exceed available quantity
          const maxQty = item.availableQuantity > 0 ? item.availableQuantity : newQty;
          const finalQty = Math.min(newQty, maxQty);
          return { ...item, quantity: finalQty };
        }
        return item;
      }),
    );
  }, []);

  const updateCartItem = useCallback(
    (
      productId: string,
      fieldOrUpdate: keyof CartItem | Partial<CartItem>,
      value?: any,
    ) => {
      setCart((prev) =>
        prev.map((item) => {
          if (item.product.oid !== productId) return item;

          if (typeof fieldOrUpdate === "object") {
            return { ...item, ...fieldOrUpdate };
          }
          return { ...item, [fieldOrUpdate]: value };
        }),
      );
    },
    [],
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.oid !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineDiscount = lineTotal * (item.discountPercent / 100);
      return acc + (lineTotal - lineDiscount);
    }, 0);

    const taxableSubtotal = cart.reduce((acc, item) => {
      if (item.product.vatTypeId === ZERO_RATED_VAT_TYPE_ID) {
        return acc;
      }
      const lineTotal = item.quantity * item.unitPrice;
      const lineDiscount = lineTotal * (item.discountPercent / 100);
      return acc + (lineTotal - lineDiscount);
    }, 0);

    const overallDiscount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - overallDiscount;
    const taxableAfterOverallDiscount =
      taxableSubtotal - taxableSubtotal * (discountPercent / 100);
    const tax = taxableAfterOverallDiscount * 0.15;
    const total = afterDiscount + tax;
    return { subtotal, tax, total, overallDiscount };
  }, [cart, discountPercent]);

  return {
    cart,
    setCart,
    addToCart,
    updateQuantity,
    updateCartItem,
    removeFromCart,
    clearCart,
    totals,
  };
}
