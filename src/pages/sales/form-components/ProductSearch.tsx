import { useState, RefObject } from "react";
import { Package, ScanLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ProductDto } from "@/types";

interface ProductSearchProps {
  products: ProductDto[];
  onSearchChange: (val: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  addToCart: (product: ProductDto) => void;
  onBarcodeScan: (barcode: string) => void | Promise<void>;
  barcodeInputRef: RefObject<HTMLInputElement>;
}

export default function ProductSearch({
  products,
  onSearchChange,
  onLoadMore,
  hasMore,
  isLoadingMore,
  addToCart,
  onBarcodeScan,
  barcodeInputRef,
}: ProductSearchProps) {
  const { t } = useTranslation("sales");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {/* QR / Barcode Scanner Input — primary input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-500">
          <ScanLine className="h-4 w-5" />
        </div>
        <Input
          ref={barcodeInputRef as any}
          placeholder={t("scanPlaceholder")}
          value={barcodeValue}
          onChange={(e) => setBarcodeValue(e.target.value)}
          disabled={isScanning}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !isScanning) {
              e.preventDefault();
              setIsScanning(true);
              try {
                await onBarcodeScan(barcodeValue);
              } finally {
                setBarcodeValue("");
                setIsScanning(false);
              }
            }
          }}
          className={`pl-10 h-10 text-lg border-green-200 focus:ring-green-500 bg-green-50/30 transition-opacity ${
            isScanning ? "opacity-50 cursor-not-allowed" : ""
          }`}
          autoFocus
        />
      </div>

      {/* Name Search Input */}
      <div className="flex-1">
        <Select
          options={products.map((p) => ({
            value: p.oid,
            label: `${p.drugName} - ${p.gtin || ""}`,
          }))}
          searchPlaceholder={t("nameSearchPlaceholder")}
          onSearchChange={onSearchChange}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onChange={(e) => {
            const prod = products.find((p) => p.oid === e.target.value);
            if (prod) {
              addToCart(prod);
            }
          }}
          value=""
          className="bg-white border-gray-200 "
        />
      </div>
    </div>
  );
}
