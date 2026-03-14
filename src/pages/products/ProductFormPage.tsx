import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import ProductForm from "./ProductForm";
import { productService } from "@/api/productService";
import { useProduct } from "@/hooks/queries/useProducts";
import { queryKeys } from "@/hooks/queries/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/utils/handleApiError";
import { CreateProductDto } from "@/types";
import Spinner from "@/components/ui/Spinner";
import { useState } from "react";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("products");
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product if ID is provided
  const { data: initialData, isLoading } = useProduct(id);

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

  if (id && isLoading) {
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
    </div>
  );
}
