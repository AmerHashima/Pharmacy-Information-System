import { Stethoscope, User, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PrescriptionOCR } from "@/api/prescriptionService";

interface OcrInfoBarProps {
  ocr: PrescriptionOCR;
}

export default function OcrInfoBar({ ocr }: OcrInfoBarProps) {
  const { t } = useTranslation("sales");

  if (!ocr.doctor && !ocr.patient && !ocr.date) return null;

  return (
    <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex flex-wrap gap-4 text-xs">
      {ocr.doctor && (
        <span className="inline-flex items-center gap-1.5 text-gray-600">
          <Stethoscope className="h-3.5 w-3.5 text-violet-500" />
          <strong>{t("doctor", "Doctor")}:</strong> {ocr.doctor}
        </span>
      )}
      {ocr.patient && (
        <span className="inline-flex items-center gap-1.5 text-gray-600">
          <User className="h-3.5 w-3.5 text-blue-500" />
          <strong>{t("patient", "Patient")}:</strong> {ocr.patient}
        </span>
      )}
      {ocr.date && (
        <span className="inline-flex items-center gap-1.5 text-gray-600">
          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
          <strong>{t("date", "Date")}:</strong> {ocr.date}
        </span>
      )}
    </div>
  );
}
