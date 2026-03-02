import { Search, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import { ProductDto } from "@/types";

interface ProductSearchProps {
  search: string;
  setSearch: (val: string) => void;
  isSearching: boolean;
  filteredProducts: ProductDto[];
  addToCart: (product: ProductDto) => void;
}

export default function ProductSearch({
  search,
  setSearch,
  isSearching,
  filteredProducts,
  addToCart,
}: ProductSearchProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <Search className="h-5 w-5" />
      </div>
      <Input
        placeholder={t("pos_search_placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 h-14 text-lg"
      />

      {search && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {isSearching ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              {t("searching")}...
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
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
                      ${p.price?.toFixed(2)}
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
  );
}
