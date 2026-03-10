import { useTranslation } from "react-i18next";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { BranchDto } from "@/types";

interface SaleGeneralInfoProps {
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  customerEmail: string;
  setCustomerEmail: (val: string) => void;
  prescriptionNumber: string;
  setPrescriptionNumber: (val: string) => void;
  doctorName: string;
  setDoctorName: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  branches: BranchDto[];
  handleBranchSearch: (val: string) => void;
  /** Called when user scrolls to the bottom of the branch dropdown. */
  onLoadMoreBranches: () => void;
  /** Whether more branch pages are available. */
  branchesHasMore: boolean;
  /** True while the next page of branches is loading. */
  isLoadingMoreBranches: boolean;
}

export default function SaleGeneralInfo({
  selectedBranchId,
  setSelectedBranchId,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  prescriptionNumber,
  setPrescriptionNumber,
  doctorName,
  setDoctorName,
  notes,
  setNotes,
  branches,
  handleBranchSearch,
  onLoadMoreBranches,
  branchesHasMore,
  isLoadingMoreBranches,
}: SaleGeneralInfoProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-gray-700 text-sm">{t("generalInfo")}</h3>

      {/* Row 1: Branch + Customer Name */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          label={t("source_branch")}
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          onSearchChange={handleBranchSearch}
          options={branches.map((b) => ({
            value: b.oid,
            label: b.branchName ?? "",
          }))}
          // ── Pagination ──────────────────────────────────────────────────
          onLoadMore={onLoadMoreBranches}
          hasMore={branchesHasMore}
          isLoadingMore={isLoadingMoreBranches}
        />
        <Input
          label={t("customerName")}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder={t("customerName")}
        />
        <Input
          label={t("customerPhone")}
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder={t("customerPhone")}
        />
      </div>

      {/* Row 2: Email + Prescription + Doctor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          label={t("customerEmail")}
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder={t("customerEmail")}
        />
        <Input
          label={t("prescriptionNumber")}
          value={prescriptionNumber}
          onChange={(e) => setPrescriptionNumber(e.target.value)}
          placeholder={t("prescriptionNumber")}
        />
        <Input
          label={t("doctorName")}
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          placeholder={t("doctorName")}
        />
      </div>

      {/* Row 3: Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("notes")}
        </label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 resize-none"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notes")}
        />
      </div>
    </div>
  );
}
