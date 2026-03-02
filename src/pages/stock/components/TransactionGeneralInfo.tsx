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
}

export default function TransactionGeneralInfo({
  typeCode,
  transactionTypeOptions,
  branchOptions,
  supplierOptions,
}: TransactionGeneralInfoProps) {
  const { t } = useTranslation("stock");
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Card className="overflow-visible h-fit">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Select
          label={t("transaction_type")}
          options={transactionTypeOptions}
          error={(errors.transactionTypeId as any)?.message}
          {...register("transactionTypeId")}
        />

        <Input
          type="date"
          label={t("transaction_date")}
          error={(errors.transactionDate as any)?.message}
          {...register("transactionDate")}
        />

        <Input
          label={t("reference_number")}
          error={(errors.referenceNumber as any)?.message}
          {...register("referenceNumber")}
        />

        {(typeCode === "STOCK_IN" || typeCode === "TRANSFER") && (
          <Select
            label={t("to_branch")}
            options={branchOptions}
            error={(errors.toBranchId as any)?.message}
            {...register("toBranchId")}
          />
        )}

        {(typeCode === "STOCK_OUT" || typeCode === "TRANSFER") && (
          <Select
            label={t("from_branch")}
            options={branchOptions}
            error={(errors.fromBranchId as any)?.message}
            {...register("fromBranchId")}
          />
        )}

        {typeCode === "STOCK_IN" && (
          <Select
            label={t("supplier")}
            options={supplierOptions}
            error={(errors.supplierId as any)?.message}
            {...register("supplierId")}
          />
        )}
      </div>

      <div className="mt-4">
        <Input
          label={t("notes")}
          error={(errors.notes as any)?.message}
          {...register("notes")}
        />
      </div>
    </Card>
  );
}
