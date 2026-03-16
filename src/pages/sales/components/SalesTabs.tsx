import { ShoppingCart, History, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SalesTabsProps {
  activeTab: "form" | "history" | "refund";
  setActiveTab: (tab: "form" | "history" | "refund") => void;
}

export default function SalesTabs({ activeTab, setActiveTab }: SalesTabsProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar">
      <button
        onClick={() => setActiveTab("form")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
          activeTab === "form"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        {t("sales_form", { defaultValue: "Sales Form" })}
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
          activeTab === "history"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <History className="h-4 w-4" />
        {t("sales_history", { defaultValue: "Sales History" })}
      </button>

      <button
        onClick={() => setActiveTab("refund")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
          activeTab === "refund"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <RotateCcw className="h-4 w-4" />
        {t("refund_history", { defaultValue: "Refund History" })}
      </button>
    </div>
  );
}
