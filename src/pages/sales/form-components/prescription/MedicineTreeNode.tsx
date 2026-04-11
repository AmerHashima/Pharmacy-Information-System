import {
  ChevronDown,
  ChevronRight,
  Pill,
  Check,
  Search,
  AlertTriangle,
} from "lucide-react";
import type { ProductDto } from "@/types";
import Spinner from "@/components/ui/Spinner";
import ProductMatchCard from "./ProductMatchCard";
import type { MedicineSelection } from "./types";

interface MedicineTreeNodeProps {
  index: number;
  sel: MedicineSelection;
  onToggle: (i: number) => void;
  onSelect: (i: number, p: ProductDto) => void;
  onDeselect: (i: number) => void;
  onSearchChange: (i: number, v: string) => void;
  onSearchSubmit: (i: number) => void;
}

export default function MedicineTreeNode({
  index,
  sel,
  onToggle,
  onSelect,
  onDeselect,
  onSearchChange,
  onSearchSubmit,
}: MedicineTreeNodeProps) {
  const med = sel.medicine;
  const confidence = parseFloat(med.read_confidence || "0");

  return (
    <div
      className={`rounded-xl border transition-all ${
        sel.selectedProduct
          ? "border-emerald-200 bg-emerald-50/30"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* ── Medicine Header ── */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors rounded-xl"
        onClick={() => onToggle(index)}
      >
        {/* expand/collapse icon */}
        <span className="text-gray-400">
          {sel.isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>

        {/* pill icon */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            sel.selectedProduct
              ? "bg-emerald-100 text-emerald-600"
              : "bg-violet-100 text-violet-600"
          }`}
        >
          {sel.selectedProduct ? (
            <Check className="h-4 w-4" />
          ) : (
            <Pill className="h-4 w-4" />
          )}
        </div>

        {/* medicine info */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900 truncate">
              {med.cleaned_name || med.ocr_name}
            </span>
            {med.corrected_from && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">
                corrected from: {med.corrected_from}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400 mt-0.5">
            {med.dose && <span>💊 {med.dose}</span>}
            {med.frequency && <span>🔁 {med.frequency}</span>}
            {med.duration && <span>⏱️ {med.duration}</span>}
            {med.route && <span>🩺 {med.route}</span>}
          </div>
        </div>

        {/* confidence badge + selected chip */}
        <div className="flex items-center gap-2">
          {sel.selectedProduct && (
            <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded-full">
              ✓ {sel.selectedProduct.drugName}
            </span>
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              confidence >= 0.8
                ? "bg-emerald-100 text-emerald-700"
                : confidence >= 0.5
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      </button>

      {/* ── Expanded Content — Product Matches ── */}
      {sel.isExpanded && (
        <div className="px-4 pb-4">
          <div className="ml-6 pl-4 border-l-2 border-gray-200 space-y-2">
            {/* search field */}
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={sel.searchTerm}
                  onChange={(e) => onSearchChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearchSubmit(index);
                  }}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => onSearchSubmit(index)}
                className="px-3 py-1.5 text-xs bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 font-medium transition-colors"
              >
                Search
              </button>
            </div>

            {/* loading */}
            {sel.isLoading && (
              <div className="flex items-center gap-2 py-4 justify-center">
                <Spinner size="sm" />
                <span className="text-xs text-gray-400">
                  Searching products...
                </span>
              </div>
            )}

            {/* no results */}
            {!sel.isLoading && sel.matchedProducts.length === 0 && (
              <div className="flex items-center gap-2 py-4 justify-center text-gray-400">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs">
                  No matching products found. Try a different search term.
                </span>
              </div>
            )}

            {/* product list */}
            {!sel.isLoading &&
              sel.matchedProducts.map((product) => (
                <ProductMatchCard
                  key={product.oid}
                  product={product}
                  isSelected={sel.selectedProduct?.oid === product.oid}
                  onToggle={() =>
                    sel.selectedProduct?.oid === product.oid
                      ? onDeselect(index)
                      : onSelect(index, product)
                  }
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
