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

// Tab Components
import BasicInfoTab from "./components/BasicInfoTab";
import StrengthPackagingTab from "./components/StrengthPackagingTab";
import RegulatoryTab from "./components/RegulatoryTab";
import StockLevelsTab from "./components/StockLevelsTab";

countries.registerLocale(enLocale);
countries.registerLocale(arLocale);

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

  const [activeTab, setActiveTab] = useState<
    "basic" | "strength" | "regulatory" | "stock"
  >("basic");

  const productTypes = getLookupDetails("PRODUCT_TYPE");
  const vatTypes = getLookupDetails("VAT_TYPE");
  const packageTypeLookups = getLookupDetails("PACKAGE_TYPE");
  const dosageForms = getLookupDetails("Dosage_Form");

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

  const tabs = [
    { id: "basic", label: t("basicInfo"), icon: Info },
    { id: "strength", label: t("strengthPackaging"), icon: Layers },
    { id: "regulatory", label: t("regulatory"), icon: ShieldCheck },
    { id: "stock", label: t("stockLevels"), icon: Database },
  ];

  const currentLang = i18n.language === "ar" ? "ar" : "en";
  const countryOptions = Object.entries(
    countries.getNames(currentLang, { select: "official" }),
  ).map(([code, name]) => ({
    value: name,
    label: name,
    flag: code,
  }));

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {activeTab === "basic" && (
          <BasicInfoTab
            register={register}
            errors={errors}
            isLoading={isLoading}
            productTypes={productTypes}
            control={control}
          />
        )}

        {activeTab === "strength" && (
          <StrengthPackagingTab
            register={register}
            isLoading={isLoading}
            packageTypeLookups={packageTypeLookups}
            control={control}
          />
        )}

        {activeTab === "regulatory" && (
          <RegulatoryTab
            register={register}
            isLoading={isLoading}
            countryOptions={countryOptions}
            packageTypeLookups={packageTypeLookups}
            dosageForms={dosageForms}
            vatTypes={vatTypes}
            control={control}
          />
        )}

        {activeTab === "stock" && (
          <StockLevelsTab register={register} isLoading={isLoading} />
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            type="submit"
            isLoading={isLoading}
            className="px-10 py-3 shadow-lg shadow-blue-200"
          >
            {initialData ? t("updateProduct") : t("createProduct")}
          </Button>
        </div>
      </form>
    </div>
  );
}
