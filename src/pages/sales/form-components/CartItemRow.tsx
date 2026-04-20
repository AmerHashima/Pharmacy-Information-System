import { Trash2, Plus, Minus, Barcode } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CartItem } from "../SaleForm";
import SelectBatch from "./SelectBatch";
import SerialNumberModal from "./SerialNumberModal";
import Badge from "@/components/ui/Badge";

interface CartItemRowProps {
  item: CartItem;
  updateQuantity: (productId: string, delta: number) => void;
  updateCartItem: (
    productId: string,
    fieldOrUpdate: keyof CartItem | Partial<CartItem>,
    value?: any,
  ) => void;
  removeFromCart: (productId: string) => void;
}

export default function CartItemRow({
  item,
  updateQuantity,
  updateCartItem,
  removeFromCart,
}: CartItemRowProps) {
  const { t } = useTranslation("sales");
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);

  const lineTotal = item.quantity * item.unitPrice;
  const discount = lineTotal * (item.discountPercent / 100);
  const subtotal = lineTotal - discount;

  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      {/* Remove */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => removeFromCart(item.product.oid)}
          className="text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
      {/* Product Name */}
      <td className="px-4 py-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm text-nowrap">
              {item.product.drugName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-gray-400">
                {t("unit")}: {item.unitPrice.toFixed(2)}
              </p>
              {item.serialNumbers.length > 0 && (
                <Badge variant="default" className="px-1 py-0 text-[8px] h-3.5">
                  {item.serialNumbers.length} {t("serials")}
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsSerialModalOpen(true)}
            className={`p-1.5 rounded transition-colors ${
              item.serialNumbers.length > 0
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                : "text-gray-300 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title={t("enter_serials")}
          >
            <Barcode className="h-4 w-4" />
          </button>
        </div>

        <SerialNumberModal
          isOpen={isSerialModalOpen}
          onClose={() => setIsSerialModalOpen(false)}
          quantity={item.quantity}
          initialSerials={item.serialNumbers}
          productName={item.product.drugName}
          onSave={(serials) =>
            updateCartItem(item.product.oid, "serialNumbers", serials)
          }
        />
      </td>

      {/* Quantity */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => updateQuantity(item.product.oid, -1)}
            className="p-1 hover:bg-white rounded border border-gray-200"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-8 text-center font-bold text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.product.oid, 1)}
            className="p-1 hover:bg-white rounded border border-gray-200"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </td>

      {/* Unit Price */}
      <td className="px-4 py-3 text-right">
        <input
          type="number"
          step="0.01"
          min="0"
          value={item.unitPrice}
          onChange={(e) =>
            updateCartItem(
              item.product.oid,
              "unitPrice",
              parseFloat(e.target.value) || 0,
            )
          }
          className="w-20 text-right text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </td>

      {/* Discount % */}
      <td className="px-3 py-3">
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={item.discountPercent}
          onChange={(e) =>
            updateCartItem(
              item.product.oid,
              "discountPercent",
              Math.min(100, parseFloat(e.target.value) || 0),
            )
          }
          className="w-16 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </td>

      {/* Batch */}
      <td className="px-3 py-3">
        {item.product.gtin ? (
          <SelectBatch
            gtin={item.product.gtin}
            onSelect={(batch) => {
              const updates: Partial<CartItem> = {
                batchNumber: batch.batchNumber || "",
              };
              if (batch.expiryDate) {
                updates.expiryDate = new Date(batch.expiryDate)
                  .toISOString()
                  .split("T")[0];
              }
              updateCartItem(item.product.oid, updates);
            }}
            placeholder={item.batchNumber || "—"}
          />
        ) : (
          <input
            type="text"
            value={item.batchNumber}
            onChange={(e) =>
              updateCartItem(item.product.oid, "batchNumber", e.target.value)
            }
            className="w-24 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="—"
          />
        )}
      </td>

      {/* Expiry */}
      <td className="px-3 py-3">
        <input
          type="date"
          value={item.expiryDate}
          onChange={(e) =>
            updateCartItem(item.product.oid, "expiryDate", e.target.value)
          }
          className="w-32 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </td>

      {/* Line Subtotal */}
      <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
        {subtotal.toFixed(2)}
      </td>
    </tr>
  );
}
