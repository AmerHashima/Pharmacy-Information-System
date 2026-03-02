import { Download, Upload, ArrowLeftRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TransactionHeaderProps {
  typeCode?: string;
}

export default function TransactionHeader({
  typeCode,
}: TransactionHeaderProps) {
  const { t } = useTranslation("stock");

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">
        {t("new_transaction", { defaultValue: "New Transaction" })}
      </h2>
      <div className="flex gap-2">
        {typeCode === "STOCK_IN" && <Download className="text-green-600" />}
        {typeCode === "STOCK_OUT" && <Upload className="text-red-600" />}
        {typeCode === "TRANSFER" && (
          <ArrowLeftRight className="text-blue-600" />
        )}
      </div>
    </div>
  );
}
