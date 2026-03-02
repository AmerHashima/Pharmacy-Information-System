import { useTranslation } from "react-i18next";
import Select from "@/components/ui/Select";
import { BranchDto, StakeholderDto } from "@/types";

interface SaleGeneralInfoProps {
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  branches: BranchDto[];
  customers: StakeholderDto[];
  handleBranchSearch: (val: string) => void;
  handleCustomerSearch: (val: string) => void;
}

export default function SaleGeneralInfo({
  selectedBranchId,
  setSelectedBranchId,
  selectedCustomerId,
  setSelectedCustomerId,
  branches,
  customers,
  handleBranchSearch,
  handleCustomerSearch,
}: SaleGeneralInfoProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label={t("source_branch")}
        value={selectedBranchId}
        onChange={(e) => setSelectedBranchId(e.target.value)}
        onSearchChange={handleBranchSearch}
        options={branches.map((b) => ({
          value: b.oid,
          label: b.branchName ?? "",
        }))}
      />
      <Select
        label={t("customer_optional")}
        value={selectedCustomerId}
        onChange={(e) => setSelectedCustomerId(e.target.value)}
        onSearchChange={handleCustomerSearch}
        options={customers.map((c) => ({
          value: c.oid,
          label: c.name ?? "",
        }))}
      />
    </div>
  );
}
