import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProductDto } from "@/types";
import {
  prescriptionService,
  PrescriptionAnalysisResponse,
} from "@/api/prescriptionService";

interface UsePrescriptionAnalysisOptions {
  addToCart: (product: ProductDto) => void;
}

export function usePrescriptionAnalysis({
  addToCart,
}: UsePrescriptionAnalysisOptions) {
  const { t } = useTranslation("sales");

  const prescriptionInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<PrescriptionAnalysisResponse | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const openFilePicker = useCallback(() => {
    prescriptionInputRef.current?.click();
  }, []);

  const handlePrescriptionUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset so the same file can be re-uploaded
      e.target.value = "";

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          t(
            "invalid_image_type",
            "Invalid image type. Please upload JPEG, PNG, WebP, or GIF.",
          ),
        );
        return;
      }

      setIsAnalyzing(true);
      try {
        const res = await prescriptionService.analyze(file);
        const data = res.data;

        if (!data.medicines || data.medicines.length === 0) {
          toast.error(
            t(
              "no_medicines_found",
              "No medicines detected in the prescription image.",
            ),
          );
          return;
        }

        setAnalysisResult(data);
        setShowAnalysisModal(true);
        toast.success(
          t(
            "prescription_analyzed",
            `Prescription analyzed! ${data.medicines.length} medicine(s) detected.`,
          ),
        );
      } catch (err: any) {
        console.error("Prescription analysis failed", err);
        toast.error(
          err.response?.data?.detail ||
            t(
              "prescription_analysis_failed",
              "Failed to analyze prescription. Please try again.",
            ),
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [t],
  );

  const handlePrescriptionConfirm = useCallback(
    (selectedProducts: ProductDto[]) => {
      selectedProducts.forEach((product) => addToCart(product));
      setShowAnalysisModal(false);
      setAnalysisResult(null);
      toast.success(
        t(
          "products_added_from_prescription",
          `${selectedProducts.length} product(s) added to cart from prescription.`,
        ),
      );
    },
    [addToCart, t],
  );

  const closeModal = useCallback(() => {
    setShowAnalysisModal(false);
    setAnalysisResult(null);
  }, []);

  return {
    prescriptionInputRef,
    isAnalyzing,
    analysisResult,
    showAnalysisModal,
    openFilePicker,
    handlePrescriptionUpload,
    handlePrescriptionConfirm,
    closeModal,
  };
}
