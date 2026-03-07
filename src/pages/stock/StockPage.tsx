import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import StockLevels from "./StockLevels";
import StockTransactions from "./StockTransactions";
import StockTabs from "./components/StockTabs";
import NewTransactionForm from "./components/NewTransactionForm";

export default function StockPage() {
  const { t } = useTranslation("stock");
  const [activeTab, setActiveTab] = useState<
    "levels" | "transactions" | "new_transaction"
  >("new_transaction");

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <PageHeader title={t("title")}>
        {/* <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveTab("new_transaction")}
            className="gap-2 shadow-lg shadow-blue-100 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t("new_transaction", { defaultValue: "New Transaction" })}
          </Button>
        </div> */}
      </PageHeader>

      <StockTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
        {activeTab === "levels" && <StockLevels />}
        {activeTab === "transactions" && <StockTransactions />}
        {activeTab === "new_transaction" && <NewTransactionForm />}
      </div>
    </div>
  );
}
