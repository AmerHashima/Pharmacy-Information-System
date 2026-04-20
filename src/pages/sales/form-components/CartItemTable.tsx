import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RefObject, ChangeEvent } from "react";
import CartItemRow from "./CartItemRow";
import ProductSearch from "./ProductSearch";
import AiPrescriptionButton from "./AiPrescriptionButton";
import type { CartItem } from "../SaleForm";
import type { ProductDto } from "@/types";

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

  // New props for search and AI Rx
  products: ProductDto[];
  onProductSearchChange: (val: string) => void;
  onLoadMoreProducts: () => void;
  productsHasMore: boolean;
  isLoadingMoreProducts: boolean;
  addToCart: (product: ProductDto) => void;
  onBarcodeScan: (barcode: string) => void | Promise<void>;
  barcodeInputRef: RefObject<HTMLInputElement>;
  isAnalyzingRx: boolean;
  prescriptionInputRef: RefObject<HTMLInputElement>;
  onPrescriptionUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onAiRxClick: () => void;
}

export default function CartItemTable({
  cart,
  setCart,
  updateQuantity,
  updateCartItem,
  removeFromCart,
  products,
  onProductSearchChange,
  onLoadMoreProducts,
  productsHasMore,
  isLoadingMoreProducts,
  addToCart,
  onBarcodeScan,
  barcodeInputRef,
  isAnalyzingRx,
  prescriptionInputRef,
  onPrescriptionUpload,
  onAiRxClick,
}: CartItemTableProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[380px] flex flex-col">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-700 whitespace-nowrap">
          <ShoppingCart className="h-4 w-4" />
          {t("cart_items")} ({cart.length})
        </h3>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <ProductSearch
              products={products}
              onSearchChange={onProductSearchChange}
              onLoadMore={onLoadMoreProducts}
              hasMore={productsHasMore}
              isLoadingMore={isLoadingMoreProducts}
              addToCart={addToCart}
              onBarcodeScan={onBarcodeScan}
              barcodeInputRef={barcodeInputRef}
            />
          </div>

          <AiPrescriptionButton
            isAnalyzing={isAnalyzingRx}
            prescriptionInputRef={prescriptionInputRef}
            onUpload={onPrescriptionUpload}
            onClickTrigger={onAiRxClick}
          />
        </div>

        {/* <button
          onClick={() => setCart([])}
          className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider whitespace-nowrap shrink-0"
        >
          {t("clear_cart")}
        </button> */}
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
                <tr className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3 font-bold text-center">
                    {t("product")}
                  </th>
                  <th className="px-4 py-3 font-bold text-center">
                    {t("qty")}
                  </th>
                  <th className="px-4 py-3 font-bold text-center">
                    {t("price")}
                  </th>
                  <th className="px-3 py-3 font-bold text-center">
                    {t("discountPercent")}
                  </th>
                  <th className="px-3 py-3 font-bold text-center">
                    {t("batchNumber")}
                  </th>
                  <th className="px-3 py-3 font-bold text-center">
                    {t("expiryDate")}
                  </th>
                  <th className="px-4 py-3 font-bold text-center">
                    {t("subtotal")}
                  </th>
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
