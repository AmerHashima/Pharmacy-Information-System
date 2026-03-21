import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

interface TransactionGeneralInfoProps {
  typeCode?: string;
  transactionTypeOptions: { value: string; label: string }[];
  branchOptions: { value: string; label: string }[];
  supplierOptions: { value: string; label: string }[];
  isViewMode?: boolean;
}

export default function TransactionGeneralInfo({
  typeCode,
  transactionTypeOptions,
  branchOptions,
  supplierOptions,
  isViewMode = false,
}: TransactionGeneralInfoProps) {
  const { t } = useTranslation("stock");
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  // console.log("typeCode", typeCode);

  return (
    <Card className="overflow-visible h-fit">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Select
          label={t("transaction_type")}
          options={transactionTypeOptions}
          value={watch("transactionTypeId")}
          error={(errors.transactionTypeId as any)?.message}
          disabled={isViewMode}
          {...register("transactionTypeId")}
        />

        <Input
          type="date"
          label={t("transaction_date")}
          value={watch("transactionDate")}
          error={(errors.transactionDate as any)?.message}
          disabled={isViewMode}
          {...register("transactionDate")}
        />

        <Input
          label={t("reference_number")}
          value={watch("referenceNumber")}
          error={(errors.referenceNumber as any)?.message}
          disabled={isViewMode}
          {...register("referenceNumber")}
        />

        <Input
          label={t("notes")}
          value={watch("notes")}
          error={(errors.notes as any)?.message}
          disabled={isViewMode}
          {...register("notes")}
        />

        {/* stock in and transfer */}
        {(typeCode === "22222222-2222-2222-2222-222222222030" ||
          typeCode === "22222222-2222-2222-2222-222222222032") && (
          <Select
            label={t("to_branch")}
            options={branchOptions}
            value={watch("toBranchId")}
            error={(errors.toBranchId as any)?.message}
            disabled={isViewMode}
            {...register("toBranchId")}
          />
        )}

        {/* stock out and transfer */}
        {(typeCode === "22222222-2222-2222-2222-222222222031" ||
          typeCode === "22222222-2222-2222-2222-222222222032") && (
          <Select
            label={t("from_branch")}
            options={branchOptions}
            value={watch("fromBranchId")}
            error={(errors.fromBranchId as any)?.message}
            disabled={isViewMode}
            {...register("fromBranchId")}
          />
        )}

        {/* stock in */}
        {typeCode === "22222222-2222-2222-2222-222222222030" && (
          <Select
            label={t("supplier")}
            options={supplierOptions}
            value={watch("supplierId")}
            error={(errors.supplierId as any)?.message}
            disabled={isViewMode}
            {...register("supplierId")}
          />
        )}
      </div>
    </Card>
  );
}
