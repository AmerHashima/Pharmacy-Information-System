import { Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AiPrescriptionButtonProps {
  isAnalyzing: boolean;
  prescriptionInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickTrigger: () => void;
}

export default function AiPrescriptionButton({
  isAnalyzing,
  prescriptionInputRef,
  onUpload,
  onClickTrigger,
}: AiPrescriptionButtonProps) {
  const { t } = useTranslation("sales");

  return (
    <>
      <input
        ref={prescriptionInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onUpload}
      />
      <button
        onClick={onClickTrigger}
        disabled={isAnalyzing}
        title={t("ai_scan_prescription", "AI Scan Prescription")}
        className={`
          relative group flex-shrink-0
          h-10 px-3 rounded-xl font-medium text-sm
          flex items-center gap-2
          transition-all duration-300 ease-out
          ${
            isAnalyzing
              ? "bg-violet-100 text-violet-400 cursor-wait"
              : "bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 active:translate-y-0"
          }
        `}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">
              {t("analyzing", "Analyzing...")}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t("ai_rx", "AI Rx")}</span>
          </>
        )}

        {/* Glow ring animation when idle */}
        {!isAnalyzing && (
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400 to-indigo-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
        )}
      </button>
    </>
  );
}
