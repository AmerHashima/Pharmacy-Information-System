import { Trash2, Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductDto } from "@/types";

interface CartItem {
  product: ProductDto;
  quantity: number;
  unitPrice: number;
}

interface CartItemRowProps {
  item: CartItem;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
}

export default function CartItemRow({
  item,
  updateQuantity,
  removeFromCart,
}: CartItemRowProps) {
  const { t } = useTranslation("sales");

  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <p className="font-bold text-gray-900 text-sm">
          {item.product.drugName}
        </p>
        <p className="text-[10px] text-gray-400">
          {t("unit")}: ${item.unitPrice.toFixed(2)}
        </p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
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
      <td className="px-6 py-4 text-right font-medium text-gray-600 text-sm">
        ${item.unitPrice.toFixed(2)}
      </td>
      <td className="px-6 py-4 text-right font-bold text-gray-900 text-sm">
        ${(item.quantity * item.unitPrice).toFixed(2)}
      </td>
      <td className="px-6 py-4 text-right">
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
