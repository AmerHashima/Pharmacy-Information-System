import { Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AnalyzingBanner() {
  const { t } = useTranslation("sales");

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border border-violet-200 p-4">
      {/* Animated shimmer bar */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-200/40 to-transparent animate-pulse"
          style={{ animationDuration: "2s" }}
        />
      </div>
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 animate-pulse">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-violet-900 text-sm">
            {t(
              "analyzing_prescription",
              "Analyzing prescription image...",
            )}
          </p>
          <p className="text-xs text-violet-600 mt-0.5">
            {t(
              "ai_reading_text",
              "AI is reading and identifying medicines from the prescription",
            )}
          </p>
        </div>
        <Loader2 className="h-5 w-5 text-violet-500 animate-spin ml-auto" />
      </div>
    </div>
  );
}
