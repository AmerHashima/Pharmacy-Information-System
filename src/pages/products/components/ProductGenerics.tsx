import { useTranslation } from "react-i18next";
import { Beaker, Search, ExternalLink, Package } from "lucide-react";
import { useAlternativeProducts } from "@/hooks/queries/useProducts";
import { useQuery } from "@tanstack/react-query";
import { genericNameService } from "@/api/genericNameService";
import { queryKeys } from "@/hooks/queries/queryKeys";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { Link } from "react-router-dom";

interface ProductGenericsProps {
  genericName: string | null;
  productId: string;
}

export default function ProductGenerics({ genericName, productId }: ProductGenericsProps) {
  const { t, i18n } = useTranslation("products");
  const isAr = i18n.language === "ar";

  // Fetch full details of the generic name RECORD
  const { data: genericDetail, isLoading: isGenericLoading } = useQuery({
    queryKey: queryKeys.genericNames.list(genericName || ""),
    queryFn: async () => {
      if (!genericName) return null;
      const { data } = await genericNameService.search(genericName);
      return data.data?.find(g => g.nameEN === genericName || g.nameAR === genericName) || null;
    },
    enabled: !!genericName,
  });

  // Fetch alternative products
  const { data: alternatives = [], isLoading: isAltsLoading } = useAlternativeProducts(
    genericName || undefined,
    productId
  );

  if (!genericName) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
        <Beaker className="h-12 w-12 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-400">{t("noGenericAssigned")}</h3>
        <p className="text-sm text-gray-400 mt-1">{t("noGenericDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Generic Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Beaker className="h-24 w-24 text-blue-600" />
          </div>
          <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">
            {t("scientificComposition")}
          </h4>
          <div className="space-y-4 relative">
            <div>
              <div className="text-sm text-blue-600/60 font-medium mb-1">English Name</div>
              <div className="text-2xl font-black text-blue-900 tracking-tight">
                {genericDetail?.nameEN || genericName}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600/60 font-medium mb-1">الاسم بالعربية</div>
              <div className="text-2xl font-black text-blue-900 tracking-tight">
                {genericDetail?.nameAR || "---"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-center text-center">
            <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t("findMoreGenerics")}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">{t("exploreGenericDatabase")}</p>
            <Link to="/generics" className="inline-flex items-center justify-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors">
                <span>{t("openGenericsManager")}</span>
                <ExternalLink className="h-4 w-4" />
            </Link>
        </div>
      </div>

      {/* Alternative Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                {t("alternativeProducts")} ({alternatives.length})
            </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isAltsLoading ? (
                <div className="col-span-full py-12 flex justify-center">
                    <Spinner size="md" />
                </div>
            ) : alternatives.length > 0 ? (
                alternatives.map((alt) => (
                    <Link 
                        key={alt.oid} 
                        to={`/products/edit/${alt.oid}`}
                        className="bg-white border border-gray-100 hover:border-blue-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 rounded-lg transition-colors">
                                <Package className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 truncate">
                                    {isAr ? alt.drugNameAr : alt.drugName}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {alt.packageTypeName || "---"}
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-sm font-mono font-bold text-blue-600">${alt.price?.toFixed(2)}</span>
                                    <Badge variant={alt.availableQuantity && alt.availableQuantity > 0 ? 'success' : 'danger'} className="text-[10px]">
                                        {alt.availableQuantity || 0} {t("inStock")}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))
            ) : (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
                    <Package className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-medium">{t("noAlternativesFound")}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
