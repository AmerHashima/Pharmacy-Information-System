import { UseFormRegister, Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import Select, { SelectOption } from "@/components/ui/Select";
import { AppLookupDetailDto } from "@/types";
import { ProductFormValues } from "../schema";
import { positiveNumberInputProps } from "@/utils/positiveNumberInputProps";

interface RegulatoryTabProps {
  register: UseFormRegister<ProductFormValues>;
  isLoading?: boolean;
  countryOptions: SelectOption[];
  packageTypeLookups: AppLookupDetailDto[];
  dosageForms: AppLookupDetailDto[];
  vatTypes: AppLookupDetailDto[];
  control: Control<ProductFormValues>;
}

export default function RegulatoryTab({
  register,
  isLoading,
  countryOptions,
  packageTypeLookups,
  dosageForms,
  vatTypes,
  control,
}: RegulatoryTabProps) {
  const { t } = useTranslation("products");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <Input
        {...register("registrationNumber")}
        label={t("registrationNumber")}
        disabled={isLoading}
        {...positiveNumberInputProps}
      />
      <Input
        {...register("manufacturer")}
        label={t("manufacturer")}
        disabled={isLoading}
      />
      <Controller
        name="countryOfOrigin"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label={t("countryOfOrigin")}
            options={countryOptions}
            disabled={isLoading}
          />
        )}
      />
      <Controller
        name="vatTypeId"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label={t("vatType")}
            // options={vatTypes.map((v) => ({
            //   value: String(v.oid),
            //   label: v.valueNameEn || v.valueNameAr || "",
            // }))}
            disabled={isLoading}
          />
        )}
      />
      {/* <Controller
        name="packageTypeId"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Package Type (Lookup)"
            options={packageTypeLookups.map((p) => ({
              value: String(p.oid),
              label: p.valueNameEn || p.valueNameAr || "",
            }))}
            disabled={isLoading}
          />
        )}
      /> */}
      <Controller
        name="dosageFormId"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label={t("dosageForm")}
            options={dosageForms.map((d) => ({
              value: String(d.oid),
              label: d.valueNameEn || d.valueNameAr || "",
            }))}
            disabled={isLoading}
          />
        )}
      />
      <Input
        {...register("productGroupId")}
        label={t("productGroup")}
        disabled={isLoading}
      />
      <div className="flex flex-col gap-4 mt-6">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register("isExportable")}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
            {t("exportable")}
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register("isImportable")}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
            {t("importable")}
          </span>
        </label>
      </div>
    </div>
  );
}
