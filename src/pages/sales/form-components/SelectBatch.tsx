import { stockService } from "@/api/stockService";
import { StockDto } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

type Props = {
  gtin: string;
  branchId: string;
  onSelect: (batch: StockDto) => void;
  placeholder?: string;
};

const SelectBatch = ({ gtin, branchId, onSelect, placeholder }: Props) => {
  const { t } = useTranslation("sales");
  const [batches, setBatches] = useState<StockDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StockDto | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const res = await stockService.query({
        request: {
          filters: [
            { propertyName: "Product.GTIN", value: gtin, operation: 2 },
            { propertyName: "branchId", value: branchId, operation: 0 },
          ],
          pagination: {
            pageNumber: 1,
            pageSize: 50,
            getAll: true,
          },
          columns: [
            "batchNumber",
            "branchId",
            "branchName",
            "quantity",
            "reservedQuantity",
            "availableQuantity",
            "oid",
            "expiryDate",
          ],
          sort: [
            {
              sortBy: "expiryDate",
              sortDirection: "asc",
            },
          ],
        },
      });
      const filteredBatches =
        res.data.data.data.filter((b) => b.availableQuantity > 0) || [];
      setBatches(filteredBatches);

      // Auto-select first batch
      if (filteredBatches.length > 0) {
        setSelectedBatch(filteredBatches[0]);
        onSelect(filteredBatches[0]);
      }
    } catch (err) {
      console.error("Failed to fetch batches", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (gtin && branchId) {
      setSelectedBatch(null); // Reset selection when branch changes
      fetchBatches();
    }
  }, [gtin, branchId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectBatch = (batch: StockDto) => {
    setSelectedBatch(batch);
    onSelect(batch);
    setIsOpen(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || batches.length === 0}
        className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded flex items-center justify-between gap-2 ${isLoading || batches.length === 0
          ? "bg-gray-50 text-gray-400 cursor-not-allowed"
          : "bg-white hover:border-gray-300 cursor-pointer"
          } focus:ring-1 focus:ring-blue-500 focus:outline-none`}
      >
        <span className="truncate">
          {isLoading
            ? t("loading")
            : selectedBatch
              ? selectedBatch.batchNumber || "—"
              : placeholder || t("select_batch")}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && !isLoading && batches.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[500px]">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[150px]">
                    {t("batch_number", "Batch Number")}
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[140px]">
                    {t("expiry_date", "Expiry Date")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 min-w-[100px]">
                    {t("quantity", "Quantity")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, index) => (
                  <tr
                    key={batch.oid}
                    onClick={() => handleSelectBatch(batch)}
                    className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${index === batches.length - 1 ? "border-b-0" : ""
                      } ${selectedBatch?.oid === batch.oid ? "bg-blue-100" : ""
                      }`}
                  >
                    <td className="px-3 py-2 text-gray-900">
                      {batch.batchNumber || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {formatDate(batch.expiryDate)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-900 font-medium">
                      {batch.availableQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isOpen && !isLoading && batches.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 px-3 py-2 text-sm text-gray-500">
          {t("no_batches")}
        </div>
      )}
    </div>
  );
};

export default SelectBatch;
