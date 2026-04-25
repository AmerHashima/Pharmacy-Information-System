import * as z from "zod";
import { TFunction } from "i18next";

export const getProductSchema = (t: TFunction) =>
  z.object({
    drugName: z.string().min(1, t("drugNameRequired")).max(200),
    gtin: z.string().optional(),
    barcode: z.string().optional(),
    drugNameAr: z.string().optional(),
    genericName: z.string().optional(),
    productTypeId: z.string().optional(),
    strengthValue: z.string().optional(),
    strengthUnit: z.string().optional(),
    packageType: z.string().optional(),
    packageSize: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    registrationNumber: z.string().optional(),
    volume: z.coerce.number().optional(),
    unitOfVolume: z.string().optional(),
    manufacturer: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    minStockLevel: z.coerce.number().optional(),
    maxStockLevel: z.coerce.number().optional(),
    discountPercentSupplierOne: z.coerce.number().min(0).max(100).optional(),
    discountPercentSupplierTwo: z.coerce.number().min(0).max(100).optional(),
    isExportable: z.boolean().default(false),
    isImportable: z.boolean().default(false),
    drugStatus: z.string().optional(),
    marketingStatus: z.string().optional(),
    legalStatus: z.string().optional(),
    vatTypeId: z.string().optional(),
    packageTypeId: z.string().optional(),
    dosageFormId: z.string().optional(),
    productGroupId: z.string().optional(),
    status: z.coerce.number().default(1),
  });

export const getProductUnitSchema = (t: TFunction) =>
  z.object({
    oid: z.string().optional(),
    productId: z.string().min(1),
    packageTypeId: z.string().min(1, t("packageTypeRequired")),
    conversionFactor: z.coerce.number().min(1, t("minConversionFactorOne")),
    price: z.coerce.number().min(0, t("minPriceZero")),
    barcode: z.string().optional().nullable(),
  });

export type ProductFormValues = z.infer<ReturnType<typeof getProductSchema>>;
export type ProductUnitFormValues = z.infer<
  ReturnType<typeof getProductUnitSchema>
>;
