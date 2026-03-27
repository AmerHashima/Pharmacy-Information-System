import { stockService } from "@/api/stockService";
import { StockDto } from "@/types";
import React, { useEffect, useState } from "react";

type Props = {
  gtin: string;
};

const SelectBatch = ({ gtin }: Props) => {
  const [batches, setBatches] = useState<StockDto[]>([]);
  const fetchBatches = async () => {
    try {
      const res = await stockService.query({
        request: {
          filters: [{ propertyName: "gtin", value: gtin, operation: 2 }],
          pagination: {
            pageNumber: 1,
            pageSize: 10,
            getAll: true,
          },
          columns: ["batchNumber", "branchId", "branchName", "oid"],
        },
      });
      setBatches(res.data.data.data || []);
    } catch (err) {
      console.error("Failed to fetch batches", err);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [gtin]);

  return (
    <div>
      {batches.map((batch) => (
        <div key={batch.oid}>
          <p>{batch.batchNumber}</p>
          <p>{batch.branchName}</p>
        </div>
      ))}
    </div>
  );
};

export default SelectBatch;
