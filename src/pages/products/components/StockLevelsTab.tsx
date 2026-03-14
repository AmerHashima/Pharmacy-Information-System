import { UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import Input from "@/components/ui/Input";
import { ProductFormValues } from "../schema";
import { positiveNumberInputProps } from "@/utils/positiveNumberInputProps";

interface StockLevelsTabProps {
  register: UseFormRegister<ProductFormValues>;
  isLoading?: boolean;
}

export default function StockLevelsTab({
  register,
  isLoading,
}: StockLevelsTabProps) {
  const { t } = useTranslation("products");

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <Input
        {...register("minStockLevel")}
        label={t("minStockLevel")}
        type="number"
        disabled={isLoading}
        {...positiveNumberInputProps}
      />
      <Input
        {...register("maxStockLevel")}
        label={t("maxStockLevel")}
        type="number"
        disabled={isLoading}
        {...positiveNumberInputProps}
      />
      {/* <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 col-span-1 md:col-span-2">
        <div className="flex gap-3 text-blue-700">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold mb-1">{t("stockLevels")}</p>
            <p>{t("stockLevels")} info...</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
