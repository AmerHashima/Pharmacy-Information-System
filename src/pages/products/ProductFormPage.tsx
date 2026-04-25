import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import ProductForm from "./ProductForm";
import { productService } from "@/api/productService";
import { useProduct, useProductUnits } from "@/hooks/queries/useProducts";
import { queryKeys } from "@/hooks/queries/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/utils/handleApiError";
import { CreateProductDto, ProductUnitDto } from "@/types";
import Spinner from "@/components/ui/Spinner";
import { useState } from "react";
import ProductUnitTable from "./components/ProductUnitTable";
import ProductUnitForm from "./components/ProductUnitForm";
import ProductGenerics from "./components/ProductGenerics";
import { Layers, Plus, Beaker } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("products");
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product if ID is provided
  const { data: initialData, isLoading: isProductLoading } = useProduct(id);

  // Fetch product units
  const { data: units = [], isLoading: isUnitsLoading } = useProductUnits(id);

  // Management state for units
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ProductUnitDto | null>(null);

  const handleSubmit = async (formData: CreateProductDto) => {
    // Ensure nulls for linkage fields
    const dataToSend = {
      ...formData,
      vatTypeId: formData.vatTypeId || null,
      productGroupId: formData.productGroupId || null,
    };

    setIsSubmitting(true);
    try {
      if (id) {
        await productService.update(id, {
          ...dataToSend,
          oid: id,
        });
        toast.success(t("productUpdated"));
      } else {
        await productService.create(dataToSend);
        toast.success(t("productCreated"));
      }

      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });

      // Navigate back to listing
      navigate("/products");
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (id && isProductLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? t("editProduct") : t("addProduct")}
        onBack={() => navigate("/products")}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <ProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>

      {id && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("productUnits")}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t("manageUnitsDescription")}
                </p>
              </div>
            </div>

            {!isAddingUnit && !editingUnit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddingUnit(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("addUnit")}
              </Button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {(isAddingUnit || editingUnit) && (
              <ProductUnitForm
                productId={id}
                initialData={editingUnit}
                onCancel={() => {
                  setIsAddingUnit(false);
                  setEditingUnit(null);
                }}
              />
            )}

            <ProductUnitTable
              productId={id}
              units={units}
              isLoading={isUnitsLoading}
              onEdit={setEditingUnit}
            />
          </div>
        </div>
      )}

      {id && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Beaker className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("scientificComposition")}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t("manageGenericsDescription")}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <ProductGenerics
              productId={id}
              genericName={initialData?.genericName || null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
