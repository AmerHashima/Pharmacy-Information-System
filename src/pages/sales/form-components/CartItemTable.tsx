import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import CartItemRow from "./CartItemRow";
import type { CartItem } from "../SaleForm";

interface CartItemTableProps {
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  updateQuantity: (productId: string, delta: number) => void;
  updateCartItem: (
    productId: string,
    fieldOrUpdate: keyof CartItem | Partial<CartItem>,
    value?: any,
  ) => void;
  removeFromCart: (productId: string) => void;
}

export default function CartItemTable({
  cart,
  setCart,
  updateQuantity,
  updateCartItem,
  removeFromCart,
}: CartItemTableProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[620px] flex flex-col">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-gray-700">
          <ShoppingCart className="h-4 w-4" />
          {t("cart_items")} ({cart.length})
        </h3>
        <button
          onClick={() => setCart([])}
          className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
        >
          {t("clear_cart")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p className="font-medium italic">{t("cart_empty_msg")}</p>
          </div>
        ) : (
          <div className="min-w-[900px] lg:min-w-0">
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-gray-50">
                <tr className="text-left text-[10px] text-gray-400 uppercase tracking-widest">
                  <th className="px-4 py-3 font-bold">{t("product")}</th>
                  <th className="px-4 py-3 font-bold text-center">
                    {t("qty")}
                  </th>
                  <th className="px-4 py-3 font-bold text-right">
                    {t("price")}
                  </th>
                  <th className="px-3 py-3 font-bold">
                    {t("discountPercent")}
                  </th>
                  <th className="px-3 py-3 font-bold">{t("batchNumber")}</th>
                  <th className="px-3 py-3 font-bold">{t("expiryDate")}</th>
                  <th className="px-4 py-3 font-bold text-right">
                    {t("subtotal")}
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <CartItemRow
                    key={item.product.oid}
                    item={item}
                    updateQuantity={updateQuantity}
                    updateCartItem={updateCartItem}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
