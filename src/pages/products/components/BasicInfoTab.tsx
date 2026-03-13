import { UseFormRegister, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { AppLookupDetailDto } from "@/types";
import { ProductFormValues } from "../schema";
import { positiveNumberInputProps } from "@/utils/positiveNumberInputProps";

interface BasicInfoTabProps {
  register: UseFormRegister<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  isLoading?: boolean;
  productTypes: AppLookupDetailDto[];
}

export default function BasicInfoTab({
  register,
  errors,
  isLoading,
  productTypes,
}: BasicInfoTabProps) {
  const { t } = useTranslation("products");
  const tc = useTranslation("common").t;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <Input
        {...register("drugName")}
        label={t("drugName") + "*"}
        placeholder="e.g. Panadol Extra"
        error={errors.drugName?.message}
        disabled={isLoading}
      />
      <Input
        {...register("gtin")}
        label={t("gtin")}
        placeholder="Global Trade Item Number"
        disabled={isLoading}
      />
      <Input
        {...register("barcode")}
        label={t("barcode")}
        placeholder="Standard barcode"
        disabled={isLoading}
      />
      <Input
        {...register("genericName")}
        label={t("genericName")}
        placeholder="e.g. Paracetamol"
        disabled={isLoading}
      />
      <Input
        {...register("drugNameAr")}
        label={t("drugNameAr")}
        placeholder="اسم الدواء بالعربية"
        disabled={isLoading}
      />
      <Select
        {...register("productTypeId")}
        label={t("productType")}
        options={productTypes.map((pt) => ({
          value: String(pt.oid),
          label: pt.valueNameEn || pt.valueNameAr || "",
        }))}
        disabled={isLoading}
      />
      <Input
        {...register("price")}
        label={t("price")}
        type="number"
        {...positiveNumberInputProps}
        step="0.01"
        disabled={isLoading}
      />
      <Select
        {...register("status")}
        label={tc("status")}
        options={[
          { value: "1", label: tc("active") },
          { value: "0", label: tc("inactive") },
        ]}
        disabled={isLoading}
      />
    </div>
  );
}
