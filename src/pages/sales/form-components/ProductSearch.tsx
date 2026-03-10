import { useState, RefObject } from "react";
import { Search, Package, ScanLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import { ProductDto } from "@/types";

interface ProductSearchProps {
  search: string;
  setSearch: (val: string) => void;
  isSearching: boolean;
  filteredProducts: ProductDto[];
  addToCart: (product: ProductDto) => void;
  onBarcodeScan: (barcode: string) => void | Promise<void>;
  barcodeInputRef: RefObject<HTMLInputElement>;
}

export default function ProductSearch({
  search,
  setSearch,
  isSearching,
  filteredProducts,
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
          <ScanLine className="h-5 w-5" />
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
          className={`pl-10 h-12 text-lg border-green-200 focus:ring-green-500 bg-green-50/30 transition-opacity ${
            isScanning ? "opacity-50 cursor-not-allowed" : ""
          }`}
          autoFocus
        />
      </div>

      {/* Name Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <Input
          placeholder={t("nameSearchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base"
        />

        {search && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
            {isSearching ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                {t("searching")}...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {filteredProducts.map((p) => (
                  <button
                    key={p.oid}
                    onClick={() => addToCart(p)}
                    className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{p.drugName}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {t("gtin")}: {p.gtin} | {t("box_of")} {p.packageSize}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-blue-600">
                        {p.price?.toFixed(2)}
                      </span>
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                        {t("in_stock")}: {p.availableQuantity || 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 font-medium">
                {t("no_products_found")} "{search}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
