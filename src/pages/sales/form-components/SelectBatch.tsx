import { stockService } from "@/api/stockService";
import { StockDto } from "@/types";
import React, { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";

type Props = {
  gtin: string;
  onSelect: (batch: StockDto) => void;
  placeholder?: string;
};

const SelectBatch = ({ gtin, onSelect, placeholder }: Props) => {
  const { t } = useTranslation("sales");
  const [batches, setBatches] = useState<StockDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const res = await stockService.query({
        request: {
          filters: [{ propertyName: "productGTIN", value: gtin, operation: 0 }],
          pagination: {
            pageNumber: 1,
            pageSize: 50,
            getAll: true,
          },
          // Ensure we get all needed fields
          columns: [
            "batchNumber",
            "branchId",
            "branchName",
            "oid",
            "availableQuantity",
            "expiryDate",
          ],
        },
      });
      setBatches(res.data.data.data || []);
    } catch (err) {
      console.error("Failed to fetch batches", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (gtin) {
      fetchBatches();
    }
  }, [gtin]);

  //old label =>  (${t("stock")}: ${batch.availableQuantity}) - ${batch.branchName}
  const options = batches.map((batch) => ({
    value: batch.oid,
    label: `${batch.batchNumber}`,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOid = e.target.value;
    const selectedBatch = batches.find((b) => b.oid === selectedOid);
    if (selectedBatch) {
      onSelect(selectedBatch);
    }
  };

  return (
    <div className="w-full min-w-[140px]">
      <Select
        name="batchNumber"
        options={options}
        onChange={handleChange}
        placeholder={
          isLoading
            ? t("loading")
            : options.length === 0
              ? t("no_batches")
              : placeholder || t("select_batch")
        }
        disabled={isLoading || options.length === 0}
        searchPlaceholder={t("search_batch")}
        className="!mb-0" // Remove default bottom margin if any
      />
    </div>
  );
};

export default SelectBatch;
