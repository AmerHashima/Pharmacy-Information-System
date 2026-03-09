import React, { memo } from "react";
import { Search } from "lucide-react";
import Card from "@/components/ui/Card";

interface RSDEmptyStateProps {
  isLoading: boolean;
}

const RSDEmptyState: React.FC<RSDEmptyStateProps> = ({ isLoading }) => {
  if (isLoading) return null;

  return (
    <Card className="p-12 border-none shadow-lg bg-white rounded-3xl flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
      {/* <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
        <Search size={32} />
      </div> */}
      <div>
        <h2 className="text-lg font-bold text-gray-700">No Details Fetched</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Enter a Dispatch Notification ID and select a branch to view and edit
          notified products.
        </p>
      </div>
    </Card>
  );
};

export default memo(RSDEmptyState);
