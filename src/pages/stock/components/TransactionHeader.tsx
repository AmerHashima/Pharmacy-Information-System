import { Download, Upload, ArrowLeftRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TransactionHeaderProps {
  typeCode?: string;
}

export default function TransactionHeader({
  typeCode,
}: TransactionHeaderProps) {
  const { t } = useTranslation("stock");

  const getTitle = () => {
    switch (typeCode) {
      case "22222222-2222-2222-2222-222222222030":
        return t("stock_in");
      case "22222222-2222-2222-2222-222222222031":
        return t("stock_out");
      case "22222222-2222-2222-2222-222222222032":
        return t("transfer");
      default:
        return t("transaction");
    }
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        {getTitle()}
      </h2>
      <div className="flex gap-2">
        {typeCode === "22222222-2222-2222-2222-222222222030" && (
          <Download className="text-green-600" />
        )}
        {typeCode === "22222222-2222-2222-2222-222222222031" && (
          <Upload className="text-red-600" />
        )}
        {typeCode === "22222222-2222-2222-2222-222222222032" && (
          <ArrowLeftRight className="text-blue-600" />
        )}
      </div>
    </div>
  );
}
