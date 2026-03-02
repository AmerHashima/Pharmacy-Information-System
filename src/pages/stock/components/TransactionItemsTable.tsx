import { Plus } from "lucide-react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TransactionItemRow from "./TransactionItemRow";
import { ProductDto } from "@/types";

interface TransactionItemsTableProps {
  products: ProductDto[];
  setProducts: React.Dispatch<React.SetStateAction<ProductDto[]>>;
  debouncedFetchProducts: (search: string) => void;
}

export default function TransactionItemsTable({
  products,
  setProducts,
  debouncedFetchProducts,
}: TransactionItemsTableProps) {
  const { t } = useTranslation("stock");
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  return (
    <Card className="overflow-visible min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t("items")}</h2>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            append({
              productId: "",
              qrcode: "",
              quantity: 1,
              unitCost: 0,
              batchNumber: "",
              expiryDate: "",
            })
          }
          className="flex items-center gap-1"
        >
          <Plus size={16} />
          {t("add_item")}
        </Button>
      </div>

      <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3 min-w-[250px]">{t("qrcode")}</th>
              <th className="px-4 py-3 min-w-[250px]">{t("product")}</th>
              <th className="px-4 py-3 w-32">{t("quantity")}</th>
              <th className="px-4 py-3 w-32">{t("unit_cost")}</th>
              <th className="px-4 py-3 w-40">{t("batch_number")}</th>
              <th className="px-4 py-3 w-40">{t("expiry_date")}</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.map((field, index) => (
              <TransactionItemRow
                key={field.id}
                index={index}
                remove={remove}
                isRemoveDisabled={fields.length === 1}
                products={products}
                setProducts={setProducts}
                debouncedFetchProducts={debouncedFetchProducts}
              />
            ))}
          </tbody>
        </table>
      </div>
      {errors.details?.root && (
        <p className="mt-2 text-sm text-red-500">
          {(errors.details.root as any).message}
        </p>
      )}
    </Card>
  );
}
