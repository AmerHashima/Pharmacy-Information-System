import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, ShieldCheck, Database, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { ProductDto, CreateProductDto, AppLookupDetailDto } from "@/types";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import arLocale from "i18n-iso-countries/langs/ar.json";
import { getProductSchema, ProductFormValues } from "./schema";
import { useLookup } from "@/context/LookupContext";
import { usePaginatedGenericNames } from "@/hooks/queries";

// Tab Components
import BasicInfoTab from "./components/BasicInfoTab";
import StrengthPackagingTab from "./components/StrengthPackagingTab";
import RegulatoryTab from "./components/RegulatoryTab";
import StockLevelsTab from "./components/StockLevelsTab";

countries.registerLocale(enLocale);
countries.registerLocale(arLocale);

const FormSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="space-y-4 pt-6 first:pt-0">
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <div className="pl-4 border-l-2 border-transparent">{children}</div>
  </div>
);

interface ProductFormProps {
  initialData?: ProductDto | null;
  onSubmit: (data: CreateProductDto) => void;
  isLoading?: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const { t, i18n } = useTranslation("products");
  const tc = useTranslation("common").t;
  const { getLookupDetails } = useLookup();

  const productTypes = getLookupDetails("PRODUCT_TYPE");
  const vatTypes = getLookupDetails("VAT_TYPE");
  const packageTypeLookups = getLookupDetails("PACKAGE_TYPE");
  const dosageForms = getLookupDetails("Dosage_Form");
  const productGroups = getLookupDetails("PRODUCT_GROUP");

  const {
    options: genericNames,
    setSearch: handleGenericNameSearch,
    loadMore: handleLoadMoreGenericNames,
    hasMore: genericNamesHasMore,
    isLoadingMore: isLoadingMoreGenericNames,
  } = usePaginatedGenericNames();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(getProductSchema(t)),
    defaultValues: {
      status: 1,
      isExportable: false,
      isImportable: false,
    },
  });

  const n = <T,>(v: T | null | undefined) => (v === null ? undefined : v);

  useEffect(() => {
    if (!initialData) return;

    reset({
      drugName: initialData.drugName ?? "",
      gtin: n(initialData.gtin),
      barcode: n(initialData.barcode),
      drugNameAr: n(initialData.drugNameAr),
      genericName: n(initialData.genericName),
      productTypeId: initialData.productTypeId
        ? String(initialData.productTypeId)
        : undefined,
      strengthValue: n(initialData.strengthValue),
      strengthUnit: n(initialData.strengthUnit),
      packageType: n(initialData.packageType),
      packageSize: n(initialData.packageSize),
      price: initialData.price ?? 0,
      registrationNumber: n(initialData.registrationNumber),
      volume: initialData.volume ?? 0,
      unitOfVolume: n(initialData.unitOfVolume),
      manufacturer: n(initialData.manufacturer),
      countryOfOrigin: n(initialData.countryOfOrigin),
      minStockLevel: initialData.minStockLevel ?? 0,
      maxStockLevel: initialData.maxStockLevel ?? 0,
      isExportable: !!initialData.isExportable,
      isImportable: !!initialData.isImportable,
      drugStatus: n(initialData.drugStatus),
      marketingStatus: n(initialData.marketingStatus),
      legalStatus: n(initialData.legalStatus),
      vatTypeId: initialData.vatTypeId
        ? String(initialData.vatTypeId)
        : undefined,
      packageTypeId: initialData.packageTypeId
        ? String(initialData.packageTypeId)
        : undefined,
      dosageFormId: initialData.dosageFormId
        ? String(initialData.dosageFormId)
        : undefined,
      productGroupId: initialData.productGroupId
        ? String(initialData.productGroupId)
        : undefined,
      status: initialData.status ?? 1,
    });
  }, [initialData, reset]);

  const currentLang = i18n.language === "ar" ? "ar" : "en";
  const countryOptions = Object.entries(
    countries.getNames(currentLang, { select: "official" }),
  ).map(([code, name]) => ({
    value: name,
    label: name,
    flag: code,
  }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-10 divide-y divide-gray-50"
    >
      <FormSection title={t("basicInfo")} icon={Info}>
        <BasicInfoTab
          register={register}
          errors={errors}
          isLoading={isLoading}
          productTypes={productTypes}
          genericNames={genericNames}
          handleGenericNameSearch={handleGenericNameSearch}
          handleLoadMoreGenericNames={handleLoadMoreGenericNames}
          genericNamesHasMore={genericNamesHasMore}
          isLoadingMoreGenericNames={isLoadingMoreGenericNames}
          control={control}
        />
      </FormSection>

      <FormSection title={t("strengthPackaging")} icon={Layers}>
        <StrengthPackagingTab
          register={register}
          isLoading={isLoading}
          packageTypeLookups={packageTypeLookups}
          control={control}
        />
      </FormSection>

      <FormSection title={t("regulatory")} icon={ShieldCheck}>
        <RegulatoryTab
          productGroups={productGroups}
          register={register}
          isLoading={isLoading}
          countryOptions={countryOptions}
          packageTypeLookups={packageTypeLookups}
          dosageForms={dosageForms}
          vatTypes={vatTypes}
          control={control}
        />
      </FormSection>

      <FormSection title={t("stockLevels")} icon={Database}>
        <StockLevelsTab register={register} isLoading={isLoading} />
      </FormSection>

      <div className="flex justify-end pt-8">
        <Button
          type="submit"
          isLoading={isLoading}
          className="px-12 py-3 shadow-lg shadow-blue-200 min-w-[200px]"
        >
          {initialData ? t("updateProduct") : t("createProduct")}
        </Button>
      </div>
    </form>
  );
}
