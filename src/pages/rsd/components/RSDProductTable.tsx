import React, { memo, useMemo } from "react";
import { CheckCircle2, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import { RsdProductDto } from "@/types";

interface RSDProductTableProps {
  products: RsdProductDto[];
  selectedIndices: number[];
  isEdited: boolean;
  isLoading: boolean;
  canAcceptDirect: boolean;
  dispatchNotificationId: string;
  onAccept: () => void;
  onToggleSelect: (index: number) => void;
  onToggleSelectAll: () => void;
  onUpdateProduct: (
    index: number,
    field: keyof RsdProductDto,
    value: any,
  ) => void;
}

const RSDProductTable: React.FC<RSDProductTableProps> = ({
  products,
  selectedIndices,
  isEdited,
  isLoading,
  canAcceptDirect,
  dispatchNotificationId,
  onAccept,
  onToggleSelect,
  onToggleSelectAll,
  onUpdateProduct,
}) => {
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            checked={
              products.length > 0 && selectedIndices.length === products.length
            }
            onChange={onToggleSelectAll}
          />
        ),
        cell: (info: any) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            checked={selectedIndices.includes(info.row.index)}
            onChange={() => onToggleSelect(info.row.index)}
          />
        ),
      },
      // {
      //   header: "GTIN",
      //   accessorKey: "gtin",
      //   cell: (info: any) => (
      //     <span className="font-bold text-gray-700">{info.getValue()}</span>
      //   ),
      // },
      {
        header: "Product Name",
        accessorKey: "productName",
        cell: (info: any) => (
          <span className="font-bold text-gray-700">{info.getValue()}</span>
        ),
      },
      {
        header: "Batch No",
        accessorKey: "batchNumber",
        cell: (info: any) => (
          <span className="text-gray-600 font-medium">{info.getValue()}</span>
        ),
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        cell: (info: any) => (
          <Input
            type="number"
            value={info.getValue()}
            onChange={(e) =>
              onUpdateProduct(
                info.row.index,
                "quantity",
                parseInt(e.target.value) || 0,
              )
            }
            className="w-24 bg-transparent border-gray-200 focus:bg-white transition-all h-9"
          />
        ),
      },
      {
        header: "Expiry Date",
        accessorKey: "expiryDate",
        cell: (info: any) => {
          const val = info.getValue();
          const dateStr = val
            ? val.includes("T")
              ? val.split("T")[0]
              : val
            : "";
          return (
            <div className="flex items-center gap-2 text-gray-600 font-medium h-9 px-3">
              <Calendar size={14} className="text-gray-400" />
              <span>{dateStr}</span>
            </div>
          );
        },
      },
    ],
    [
      products.length,
      selectedIndices.length,
      onToggleSelectAll,
      onToggleSelect,
      onUpdateProduct,
    ],
  );

  if (products.length === 0) return null;

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-white rounded-3xl min-h-[300px]">
      <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/30 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Notified Products
            </h2>
            <p className="text-xs text-gray-500 font-medium font-mono uppercase tracking-tight">
              ID: {dispatchNotificationId}{" "}
              {isEdited && (
                <span className="text-amber-500 ml-2">(Edited)</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider">
            {selectedIndices.length}/{products.length} Selected
          </span>
          <Button
            variant={canAcceptDirect ? "primary" : "success"}
            size="sm"
            className={`shadow-sm flex items-center gap-2 ${
              canAcceptDirect ? "shadow-blue-200" : "shadow-emerald-200"
            }`}
            disabled={isLoading || selectedIndices.length === 0}
            onClick={onAccept}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle2 size={16} />
                {canAcceptDirect ? "Accept Direct" : "Accept Batch"}
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={products}
          isLoading={isLoading}
          className="border-separate border-spacing-0"
        />
      </div>
    </Card>
  );
};

export default memo(RSDProductTable);
