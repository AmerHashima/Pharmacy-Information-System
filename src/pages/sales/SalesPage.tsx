import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import SaleForm from "./SaleForm";
import SalesTabs from "./components/SalesTabs";
import SalesHistory from "./components/SalesHistory";
import RefundHistory from "./components/RefundHistory";

export default function SalesPage() {
  const { t } = useTranslation("sales");
  const [activeTab, setActiveTab] = useState<"form" | "history" | "refund">(
    "form",
  );

  return (
    <div className="space-y-1">
      <PageHeader
        title={t("title")}
        // onAddClick={() => setActiveTab("form")}
        // addLabel={t("new_sale")}
      />

      <SalesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
        {activeTab === "form" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <SaleForm />
          </div>
        )}
        {activeTab === "history" && <SalesHistory />}
        {activeTab === "refund" && <RefundHistory />}
      </div>
    </div>
  );
}
