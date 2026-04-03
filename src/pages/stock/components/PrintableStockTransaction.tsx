import { forwardRef } from "react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { StockTransactionResponseDto } from "@/types";

interface PrintableStockTransactionProps {
  transactionData: StockTransactionResponseDto;
}

const PrintableStockTransaction = forwardRef<
  HTMLDivElement,
  PrintableStockTransactionProps
>(({ transactionData }, ref) => {
  const headerInfo = [
    {
      labelEn: "From Branch",
      labelAr: "من فرع",
      value: transactionData.fromBranchName || "---",
    },
    {
      labelEn: "To Branch",
      labelAr: "إلى فرع",
      value: transactionData.toBranchName || "---",
    },
    {
      labelEn: "Date",
      labelAr: "التاريخ",
      value: transactionData.transactionDate
        ? format(
            new Date(transactionData.transactionDate),
            "yyyy/MM/dd h:mm:ss a",
          )
        : "---",
    },
    {
      labelEn: "Supplier",
      labelAr: "المورد",
      value: transactionData.supplierName || "---",
    },
    {
      labelEn: "Type",
      labelAr: "النوع",
      value: transactionData.transactionTypeName || "---",
    },
    {
      labelEn: "Status",
      labelAr: "الحالة",
      value: transactionData.status || "---",
    },
  ];

  return (
    <div
      ref={ref}
      className="hidden print:block bg-white text-black p-4 space-y-4 text-xs font-sans w-full"
      style={{ direction: "ltr" }}
    >
      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-4">
        {headerInfo.map((info, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center border-b border-gray-100 py-0.5"
          >
            <div className="flex gap-2">
              <span className="font-bold w-20">{info.labelEn}</span>
              <span className="font-medium">{info.value}</span>
            </div>
            <span
              className="font-bold text-right w-16"
              style={{ direction: "rtl" }}
            >
              {info.labelAr}
            </span>
          </div>
        ))}
      </div>

      {/* Title */}
      <div className="text-center border-y-2 border-black py-1 mt-4">
        <h1 className="text-xs font-bold uppercase">
          Stock Transaction - معاملة مخزون
        </h1>
      </div>

      {/* Order Info */}
      <div className="text-center space-y-1 py-2">
        <div className="font-bold">
          {transactionData.referenceNumber || transactionData.oid}
        </div>
        {transactionData.notes && (
          <div className="text-[10px] text-gray-600">
            {transactionData.notes}
          </div>
        )}
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 border-b-2 border-black py-1 font-bold text-center mt-4">
        <div className="col-span-1 flex flex-col items-center">
          <span style={{ direction: "rtl" }}>#</span>
        </div>
        <div className="col-span-2 flex flex-col items-center">
          <span style={{ direction: "rtl" }}>عدد</span>
          <span>Qty</span>
        </div>
        <div className="col-span-5 flex flex-col items-center">
          <span style={{ direction: "rtl" }}>المنتجات</span>
          <span>Products</span>
        </div>
        <div className="col-span-2 flex flex-col items-center">
          <span style={{ direction: "rtl" }}>سعر</span>
          <span>Price</span>
        </div>
        <div className="col-span-2 flex flex-col items-center">
          <span style={{ direction: "rtl" }}>اجمالي</span>
          <span>Total</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y border-b border-black">
        {transactionData.details?.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 py-1 text-center items-center"
          >
            <div className="col-span-1">{item.lineNumber}</div>
            <div className="col-span-2">{item.quantity}</div>
            <div className="col-span-5 text-left px-2">
              <div className="font-medium">{item.productName}</div>
              {item.batchNumber && (
                <div className="text-[9px] text-gray-500">
                  Batch: {item.batchNumber}
                </div>
              )}
            </div>
            <div className="col-span-2">{item.unitCost?.toFixed(2)}</div>
            <div className="col-span-2">{item.totalCost?.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="space-y-1 mt-4">
        <div className="flex justify-between items-center py-2">
          <div className="flex gap-4 text-sm">
            <span className="font-black w-32">Total Value</span>
            <span className="font-black underline decoration-double">
              {transactionData.totalValue?.toFixed(2)}
            </span>
          </div>
          <span
            className="font-black text-sm text-right"
            style={{ direction: "rtl" }}
          >
            إجمالي القيمة
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center pt-6 pb-4">
        <QRCodeSVG
          value={transactionData.oid || transactionData.referenceNumber || "N/A"}
          size={128}
          level="M"
        />
      </div>

      {/* Footer */}
      <div
        className="text-center pt-4 border-t-2 border-black font-bold text-[10px]"
        style={{ direction: "rtl" }}
      >
        معاملة مخزون - Stock Transaction Document
      </div>
    </div>
  );
});

PrintableStockTransaction.displayName = "PrintableStockTransaction";

export default PrintableStockTransaction;
