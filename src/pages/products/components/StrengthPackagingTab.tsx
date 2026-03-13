import { UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ProductFormValues } from "../schema";
import { positiveNumberInputProps } from "@/utils/positiveNumberInputProps";
import { AppLookupDetailDto } from "@/types";

interface StrengthPackagingTabProps {
  register: UseFormRegister<ProductFormValues>;
  isLoading?: boolean;
  packageTypeLookups: AppLookupDetailDto[];
}

export default function StrengthPackagingTab({
  register,
  isLoading,
  packageTypeLookups,
}: StrengthPackagingTabProps) {
  const { t } = useTranslation("products");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register("strengthValue")}
          label={t("strengthValue")}
          placeholder="500"
          {...positiveNumberInputProps}
          disabled={isLoading}
        />
        <Input
          {...register("strengthUnit")}
          label={t("strengthUnit")}
          placeholder="mg"
          {...positiveNumberInputProps}
          disabled={isLoading}
        />
      </div>
      <Select
        {...register("packageType")}
        label={t("packageType")}
        options={packageTypeLookups.map((p) => ({
          value: p.valueNameEn || p.valueNameAr || "",
          label: p.valueNameEn || p.valueNameAr || "",
        }))}
        disabled={isLoading}
      />
      <Input
        {...register("packageSize")}
        label={t("packageSize")}
        placeholder="e.g. 24 Tablets"
        disabled={isLoading}
        {...positiveNumberInputProps}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register("volume")}
          label={t("volume")}
          type="number"
          {...positiveNumberInputProps}
          disabled={isLoading}
        />
        <Input
          {...register("unitOfVolume")}
          label={t("unitOfVolume")}
          placeholder="ml"
          {...positiveNumberInputProps}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
