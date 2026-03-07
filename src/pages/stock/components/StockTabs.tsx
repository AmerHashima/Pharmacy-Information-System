import { Package, History, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StockTabsProps {
  activeTab: "levels" | "transactions" | "new_transaction";
  setActiveTab: (tab: "levels" | "transactions" | "new_transaction") => void;
}

export default function StockTabs({ activeTab, setActiveTab }: StockTabsProps) {
  const { t } = useTranslation("stock");

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar">
      <button
        onClick={() => setActiveTab("new_transaction")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
          activeTab === "new_transaction"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <Plus className="h-4 w-4" />
        {t("new_transaction", { defaultValue: "New Transaction" })}
      </button>
      <button
        onClick={() => setActiveTab("transactions")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
          activeTab === "transactions"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <History className="h-4 w-4" />
        {t("transaction_history")}
      </button>
      <button
        onClick={() => setActiveTab("levels")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
          activeTab === "levels"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <Package className="h-4 w-4" />
        {t("stock_levels")}
      </button>
    </div>
  );
}
