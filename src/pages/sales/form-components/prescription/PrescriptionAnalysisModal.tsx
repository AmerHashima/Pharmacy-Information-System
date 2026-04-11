import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { productService } from "@/api/productService";
import { FilterOperation, ProductDto } from "@/types";
import type { PrescriptionAnalysisResponse } from "@/api/prescriptionService";

import OcrInfoBar from "./OcrInfoBar";
import MedicineTreeNode from "./MedicineTreeNode";
import type { MedicineSelection } from "./types";

interface PrescriptionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: PrescriptionAnalysisResponse;
  onConfirm: (products: ProductDto[]) => void;
}

export default function PrescriptionAnalysisModal({
  isOpen,
  onClose,
  analysisResult,
  onConfirm,
}: PrescriptionAnalysisModalProps) {
  const { t } = useTranslation("sales");
  const [selections, setSelections] = useState<MedicineSelection[]>([]);

  /* ── product search helper ── */
  const searchProducts = useCallback(
    async (term: string, index: number) => {
      setSelections((prev) =>
        prev.map((s, i) => (i === index ? { ...s, isLoading: true } : s)),
      );

      try {
        const res = await productService.query({
          request: {
            filters: term.trim()
              ? [
                  {
                    propertyName: "drugName",
                    value: term,
                    operation: FilterOperation.Contains,
                  },
                ]
              : [],
            sort: [],
            pagination: { pageNumber: 1, pageSize: 20 },
          },
        });

        setSelections((prev) =>
          prev.map((s, i) =>
            i === index
              ? {
                  ...s,
                  matchedProducts: res.data.data?.data ?? [],
                  isLoading: false,
                }
              : s,
          ),
        );
      } catch {
        setSelections((prev) =>
          prev.map((s, i) =>
            i === index ? { ...s, matchedProducts: [], isLoading: false } : s,
          ),
        );
      }
    },
    [],
  );

  /* ── initialise selections from analysis result ── */
  useEffect(() => {
    if (!analysisResult?.medicines?.length) return;

    const initial: MedicineSelection[] = analysisResult.medicines.map((m) => ({
      medicine: m,
      matchedProducts: [],
      selectedProduct: null,
      isExpanded: true,
      isLoading: true,
      searchTerm: m.cleaned_name || m.ocr_name,
    }));

    setSelections(initial);

    initial.forEach((_, idx) => {
      const name =
        analysisResult.medicines[idx].cleaned_name ||
        analysisResult.medicines[idx].ocr_name;
      searchProducts(name, idx);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResult]);

  /* ── handlers ── */
  const toggleExpand = (index: number) =>
    setSelections((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, isExpanded: !s.isExpanded } : s,
      ),
    );

  const selectProduct = (index: number, product: ProductDto) =>
    setSelections((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, selectedProduct: product } : s,
      ),
    );

  const unselectProduct = (index: number) =>
    setSelections((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, selectedProduct: null } : s,
      ),
    );

  const handleSearchChange = (index: number, value: string) =>
    setSelections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, searchTerm: value } : s)),
    );

  const handleSearchSubmit = (index: number) => {
    const term = selections[index]?.searchTerm;
    if (term) searchProducts(term, index);
  };

  const handleConfirm = () => {
    const chosen = selections
      .filter((s) => s.selectedProduct !== null)
      .map((s) => s.selectedProduct!);
    onConfirm(chosen);
  };

  const selectedCount = selections.filter((s) => s.selectedProduct).length;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ───── Header ───── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {t("ai_prescription_results", "AI Prescription Analysis")}
              </h3>
              <p className="text-xs text-gray-500">
                {t(
                  "select_matching_products",
                  "Select matching products for each detected medicine",
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/60 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* ───── OCR Info ───── */}
        {analysisResult.ocr && <OcrInfoBar ocr={analysisResult.ocr} />}

        {/* ───── Body — Medicine Tree ───── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {selections.map((sel, idx) => (
            <MedicineTreeNode
              key={idx}
              index={idx}
              sel={sel}
              onToggle={toggleExpand}
              onSelect={selectProduct}
              onDeselect={unselectProduct}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
          ))}
        </div>

        {/* ───── Footer ───── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {selectedCount} / {selections.length}{" "}
            {t("medicines_selected", "medicines selected")}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("cancel", "Cancel")}
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="px-6 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {t("next", "Next")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
