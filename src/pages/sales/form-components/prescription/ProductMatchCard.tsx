import { Check, Package } from "lucide-react";
import type { ProductDto } from "@/types";

interface ProductMatchCardProps {
  product: ProductDto;
  isSelected: boolean;
  onToggle: () => void;
}

export default function ProductMatchCard({
  product,
  isSelected,
  onToggle,
}: ProductMatchCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
        isSelected
          ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200"
          : "border-gray-100 bg-gray-50/50 hover:border-violet-200 hover:bg-violet-50/30"
      }`}
    >
      {/* radio indicator */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected
            ? "border-emerald-500 bg-emerald-500"
            : "border-gray-300"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>

      {/* product icon */}
      <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
        <Package className="h-3.5 w-3.5 text-gray-400" />
      </div>

      {/* product info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {product.drugName}
        </p>
        <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-400 mt-0.5">
          {product.genericName && <span>{product.genericName}</span>}
          {product.fullStrength && (
            <span className="text-violet-500">{product.fullStrength}</span>
          )}
          {product.dosageFormName && <span>{product.dosageFormName}</span>}
        </div>
      </div>

      {/* price */}
      {product.price != null && (
        <span className="text-xs font-bold text-gray-600 flex-shrink-0">
          {product.price.toFixed(2)} SAR
        </span>
      )}
    </button>
  );
}
