import {
  UseFormRegister,
  FieldErrors,
  Control,
  Controller,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { AppLookupDetailDto, GenericNameDto } from "@/types";
import { ProductFormValues } from "../schema";
import { positiveNumberInputProps } from "@/utils/positiveNumberInputProps";
import { getUniqueOptions } from "@/utils/lookupUtils";

interface BasicInfoTabProps {
  register: UseFormRegister<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  isLoading?: boolean;
  productTypes: AppLookupDetailDto[];
  genericNames: GenericNameDto[];
  handleGenericNameSearch: (val: string) => void;
  handleLoadMoreGenericNames: () => void;
  genericNamesHasMore: boolean;
  isLoadingMoreGenericNames: boolean;
  control: Control<ProductFormValues>;
}

export default function BasicInfoTab({
  register,
  errors,
  isLoading,
  productTypes,
  genericNames,
  handleGenericNameSearch,
  handleLoadMoreGenericNames,
  genericNamesHasMore,
  isLoadingMoreGenericNames,
  control,
}: BasicInfoTabProps) {
  const { t } = useTranslation("products");
  const tc = useTranslation("common").t;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
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
      <Controller
        name="genericName"
        control={control}
        render={({ field }) => {
          const baseOptions = genericNames.map((g) => ({
            value: g.nameEN,
            label: g.nameEN,
          }));

          // If there's an existing mapped genericName that isn't loaded dynamically yet (like during Edit mode), we inject it manually.
          if (
            field.value &&
            !baseOptions.some((o) => o.value === field.value)
          ) {
            baseOptions.unshift({ value: field.value, label: field.value });
          }

          return (
            <Select
              {...field}
              label={t("genericName")}
              options={baseOptions}
              onSearchChange={handleGenericNameSearch}
              onLoadMore={handleLoadMoreGenericNames}
              hasMore={genericNamesHasMore}
              isLoadingMore={isLoadingMoreGenericNames}
              disabled={isLoading}
            />
          );
        }}
      />
      <Input
        {...register("drugNameAr")}
        label={t("drugNameAr")}
        placeholder="اسم الدواء بالعربية"
        disabled={isLoading}
      />
      <Controller
        name="productTypeId"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label={t("productType")}
            options={getUniqueOptions(productTypes)}
            disabled={isLoading}
          />
        )}
      />
      <Input
        {...register("price")}
        label={t("price")}
        type="number"
        {...positiveNumberInputProps}
        step="0.01"
        disabled={isLoading}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label={tc("status")}
            options={[
              { value: "1", label: tc("active") },
              { value: "0", label: tc("inactive") },
            ]}
            disabled={isLoading}
          />
        )}
      />
    </div>
  );
}
