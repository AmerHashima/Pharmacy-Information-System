import React, { memo } from "react";
import { Search } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { BranchDto } from "@/types";

interface RSDSearchFormProps {
  dispatchNotificationId: string;
  setDispatchNotificationId: (val: string) => void;
  branchId: string;
  setBranchId: (val: string) => void;
  branches: BranchDto[];
  isLoading: boolean;
  onFetch: () => void;
}

const RSDSearchForm: React.FC<RSDSearchFormProps> = ({
  dispatchNotificationId,
  setDispatchNotificationId,
  branchId,
  setBranchId,
  branches,
  isLoading,
  onFetch,
}) => {
  return (
    <Card className="p-6 border-none shadow-lg bg-white rounded-3xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Dispatch Notification ID
          </label>
          <Input
            placeholder="Enter Notification ID"
            value={dispatchNotificationId}
            onChange={(e) => setDispatchNotificationId(e.target.value)}
            className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-blue-500/20"
            icon={<Search size={18} />}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Branch
          </label>
          <Select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            options={branches.map((b) => ({
              value: b.oid,
              label: b.branchName || "",
            }))}
            className="bg-gray-50 border-gray-100 h-[42px]"
          />
        </div>
        <Button
          onClick={onFetch}
          disabled={isLoading}
          className="h-[42px] px-8 shadow-sm shadow-blue-200 active:scale-95 transition-transform font-bold"
        >
          {isLoading ? "Fetching..." : "Fetch Details"}
        </Button>
      </div>
    </Card>
  );
};

export default memo(RSDSearchForm);
