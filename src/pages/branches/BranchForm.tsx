import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { BranchDto, AppLookupDetailDto } from "@/types";
import { lookupService } from "@/api/lookupService";


const branchSchema = z.object({
  branchCode: z.string().optional(),
  branchName: z.string().min(1, "Branch name is required").max(100),
  gln: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  crn: z.string().max(20).optional(),
  vatNumber: z.string().max(20).optional(),
  identifyLookupId: z.string().optional(),
  identifyValue: z.string().optional(),
  streetName: z.string().max(100).optional(),
  buildingNumber: z.string().max(10).optional(),
  citySubdivisionName: z.string().max(100).optional(),
  cityName: z.string().max(100).optional(),
  postalZone: z.string().max(10).optional(),
  registrationName: z.string().max(200).optional(),
  status: z.coerce.number().default(1),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchFormProps {
  initialData?: BranchDto | null;
  onSubmit: (data: BranchFormValues) => void;
  isLoading?: boolean;
}

export default function BranchForm({
  initialData,
  onSubmit,
  isLoading = false,
}: BranchFormProps) {
  const { t } = useTranslation("branches");
  const tc = useTranslation("common").t;
  const [identifyTypes, setIdentifyTypes] = useState<AppLookupDetailDto[]>([]);
  const compactInputClass = "px-2.5 py-1.5";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      status: 1,
    },
  });

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const res = await lookupService.getByCode("IDENTIFY_TYPE");
        setIdentifyTypes(res.data.data?.lookupDetails || []);
      } catch (err) {
        console.error("Failed to fetch identification types", err);
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        branchCode: initialData.branchCode || "",
        branchName: initialData.branchName || "",
        gln: initialData.gln || "",
        city: initialData.city || "",
        district: initialData.district || "",
        address: initialData.address || "",
        crn: initialData.crn || "",
        vatNumber: initialData.vatNumber || "",
        identifyLookupId: initialData.identifyLookupId || "",
        identifyValue: initialData.identifyValue || "",
        streetName: initialData.streetName || "",
        buildingNumber: initialData.buildingNumber || "",
        citySubdivisionName: initialData.citySubdivisionName || "",
        cityName: initialData.cityName || "",
        postalZone: initialData.postalZone || "",
        registrationName: initialData.registrationName || "",
        status: initialData.status ?? 1,
      });
    } else {
      reset({
        branchCode: "",
        branchName: "",
        gln: "",
        city: "",
        district: "",
        address: "",
        crn: "",
        vatNumber: "",
        identifyLookupId: "",
        identifyValue: "",
        streetName: "",
        buildingNumber: "",
        citySubdivisionName: "",
        cityName: "",
        postalZone: "",
        registrationName: "",
        status: 1,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <Input
          {...register("branchName")}
          label={t("branchName") + "*"}
          placeholder="e.g. Main Branch"
          error={errors.branchName?.message}
          disabled={isLoading}
          className={compactInputClass}
        />
        <Input
          {...register("branchCode")}
          label={t("branchCode")}
          placeholder="e.g. BR-001"
          error={errors.branchCode?.message}
          disabled={isLoading}
          className={compactInputClass}
        />
        <Input
          {...register("gln")}
          label={t("gln")}
          placeholder="13-digit number"
          error={errors.gln?.message}
          disabled={isLoading}
          className={compactInputClass}
        />
        <Input
          {...register("city")}
          label={t("city")}
          placeholder="e.g. Riyadh"
          error={errors.city?.message}
          disabled={isLoading}
          className={compactInputClass}
        />
        <Input
          {...register("district")}
          label={t("district")}
          placeholder="e.g. Al-Olaya"
          error={errors.district?.message}
          disabled={isLoading}
          className={compactInputClass}
        />
        <Input
          {...register("address")}
          label={t("address")}
          placeholder="Street name, building number..."
          error={errors.address?.message}
          disabled={isLoading}
          className={`${compactInputClass} lg:col-span-2`}
        />
        <Select
          {...register("status")}
          label={tc("status")}
          options={[
            { value: 1, label: tc("active") },
            { value: 0, label: tc("inactive") },
          ]}
          error={errors.status?.message}
          disabled={isLoading}
        />
      </div>

      {/* ── Legal & Regulatory ───────────────────────────────────────── */}
      <div className="pt-3 mt-3 border-t border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
          {t("legalRegulatory")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <Input
            {...register("crn")}
            label={t("crn")}
            placeholder="Max 20 characters"
            error={errors.crn?.message}
            disabled={isLoading}
            className={compactInputClass}
          />
          <Input
            {...register("vatNumber")}
            label={t("vatNumber")}
            placeholder="Max 20 characters"
            error={errors.vatNumber?.message}
            disabled={isLoading}
            className={compactInputClass}
          />
          <Select
            {...register("identifyLookupId")}
            label={t("identificationType")}
            options={identifyTypes.map((t) => ({
              value: t.oid,
              label: t.valueNameEn || t.valueNameAr || "",
            }))}
            disabled={isLoading}
          />
          <Input
            {...register("identifyValue")}
            label={t("identificationValue")}
            placeholder="Enter identification value"
            disabled={isLoading}
            className={compactInputClass}
          />
          <Input
            {...register("registrationName")}
            label={t("registrationName")}
            placeholder="Max 200 characters"
            error={errors.registrationName?.message}
            disabled={isLoading}
            className={`${compactInputClass} lg:col-span-2`}
          />
        </div>
      </div>

      {/* ── Address Details ───────────────────────────────────────────── */}
      <div className="pt-3 mt-3 border-t border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
          {t("addressDetails")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <Input
            {...register("streetName")}
            label={t("streetName")}
            placeholder="Max 100 characters"
            error={errors.streetName?.message}
            disabled={isLoading}
            className={`${compactInputClass} lg:col-span-2`}
          />
          <Input
            {...register("buildingNumber")}
            label={t("buildingNumber")}
            placeholder="Max 10 characters"
            error={errors.buildingNumber?.message}
            disabled={isLoading}
            className={compactInputClass}
          />
          <Input
            {...register("citySubdivisionName")}
            label={t("citySubdivision")}
            placeholder="Max 100 characters"
            error={errors.citySubdivisionName?.message}
            disabled={isLoading}
            className={compactInputClass}
          />
          <Input
            {...register("cityName")}
            label={t("cityName")}
            placeholder="Max 100 characters"
            error={errors.cityName?.message}
            disabled={isLoading}
            className={compactInputClass}
          />
          <Input
            {...register("postalZone")}
            label={t("postalZone")}
            placeholder="Max 10 characters"
            error={errors.postalZone?.message}
            disabled={isLoading}
            className={compactInputClass}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-8 py-2.5"
        >
          {initialData ? t("updateBranch") : t("createBranch")}
        </Button>
      </div>

    </form>
  );
}
