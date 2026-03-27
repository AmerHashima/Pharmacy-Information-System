import { Trash2, Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CartItem } from "../SaleForm";
import SelectBatch from "./SelectBatch";

interface CartItemRowProps {
  item: CartItem;
  updateQuantity: (productId: string, delta: number) => void;
  updateCartItem: (
    productId: string,
    field: keyof CartItem,
    value: any,
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

  const lineTotal = item.quantity * item.unitPrice;
  const discount = lineTotal * (item.discountPercent / 100);
  const subtotal = lineTotal - discount;

  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      {/* Product Name */}
      <td className="px-4 py-3">
        <p className="font-bold text-gray-900 text-sm">
          {item.product.drugName}
        </p>
        <p className="text-[10px] text-gray-400">
          {t("unit")}: {item.unitPrice.toFixed(2)}
        </p>
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
              updateCartItem(
                item.product.oid,
                "batchNumber",
                batch.batchNumber || "",
              );
              if (batch.expiryDate) {
                updateCartItem(
                  item.product.oid,
                  "expiryDate",
                  new Date(batch.expiryDate).toISOString().split("T")[0],
                );
              }
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

      {/* Remove */}
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => removeFromCart(item.product.oid)}
          className="text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
