import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { ProductDto } from "@/types";

interface TransactionItemRowProps {
  index: number;
  remove: (index: number) => void;
  isRemoveDisabled: boolean;
  products: ProductDto[];
  setProducts: React.Dispatch<React.SetStateAction<ProductDto[]>>;
  debouncedFetchProducts: (search: string) => void;
  /** Called when the user scrolls to the bottom of the product dropdown. */
  onLoadMoreProducts: () => void;
  /** Whether more product pages are available on the server. */
  productsHasMore: boolean;
  /** True while the next page of products is in-flight. */
  isLoadingMoreProducts: boolean;
}

export default function TransactionItemRow({
  index,
  remove,
  isRemoveDisabled,
  products,
  setProducts: _setProducts,
  debouncedFetchProducts,
  onLoadMoreProducts,
  productsHasMore,
  isLoadingMoreProducts,
}: TransactionItemRowProps) {
  const { t } = useTranslation("stock");
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  const getProductOptions = () =>
    products.map((p) => ({
      value: p.oid,
      label: `${p.drugName} - ${p.gtin || ""}`,
    }));

  const itemErrors = (errors.details as any)?.[index];

  return (
    <tr className="group hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0">
      <td className="px-5 py-3">
        <Select
          data-row={index}
          data-col={0}
          options={getProductOptions()}
          value={watch(`details.${index}.productId`)}
          error={itemErrors?.productId?.message}
          {...register(`details.${index}.productId`, {
            onChange: (e) => {
              const prod = products.find((p) => p.oid === e.target.value);
              if (prod) {
                setValue(`details.${index}.unitCost`, prod.price || 0);
                trigger(`details.${index}.unitCost`);
              }
              trigger(`details.${index}.productId`);
            },
          })}
          onSearchChange={debouncedFetchProducts}
          // ── Pagination ────────────────────────────────────────────────────
          onLoadMore={onLoadMoreProducts}
          hasMore={productsHasMore}
          isLoadingMore={isLoadingMoreProducts}
        />
      </td>

      <td className="px-5 py-3">
        <Input
          data-row={index}
          data-col={1}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={watch(`details.${index}.quantity`)}
          onKeyDown={(e) => {
            if (["-", "e", "E"].includes(e.key)) e.preventDefault();
          }}
          error={itemErrors?.quantity?.message}
          className="bg-transparent border-gray-200 focus:bg-white transition-all"
          {...register(`details.${index}.quantity`, {
            valueAsNumber: true,
            min: 0,
            onChange: (e) => {
              setValue(
                `details.${index}.quantity`,
                parseFloat(e.target.value) || 0,
              );
              trigger(`details.${index}.quantity`);
            },
          })}
        />
      </td>
      <td className="px-5 py-3">
        <Input
          data-row={index}
          data-col={2}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={watch(`details.${index}.unitCost`)}
          onKeyDown={(e) => {
            if (["-", "e", "E"].includes(e.key)) e.preventDefault();
          }}
          error={itemErrors?.unitCost?.message}
          className="bg-transparent border-gray-200 focus:bg-white transition-all"
          {...register(`details.${index}.unitCost`, {
            valueAsNumber: true,
            min: 0,
            onChange: (e) => {
              setValue(
                `details.${index}.unitCost`,
                parseFloat(e.target.value) || 0,
              );
              trigger(`details.${index}.unitCost`);
            },
          })}
        />
      </td>
      <td className="px-5 py-3">
        <Input
          data-row={index}
          data-col={3}
          placeholder={t("batch_placeholder")}
          value={watch(`details.${index}.batchNumber`)}
          className="bg-transparent border-gray-200 focus:bg-white transition-all"
          {...register(`details.${index}.batchNumber`, {
            onChange: (e) => {
              setValue(`details.${index}.batchNumber`, e.target.value);
              trigger(`details.${index}.batchNumber`);
            },
          })}
        />
      </td>
      <td className="px-5 py-3">
        <Input
          data-row={index}
          data-col={4}
          type="date"
          value={watch(`details.${index}.expiryDate`)}
          className="bg-transparent border-gray-200 focus:bg-white transition-all"
          {...register(`details.${index}.expiryDate`, {
            onChange: (e) => {
              setValue(`details.${index}.expiryDate`, e.target.value);
              trigger(`details.${index}.expiryDate`);
            },
          })}
        />
      </td>
      <td className="px-5 py-3 text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          disabled={isRemoveDisabled}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
        >
          <Trash2 size={18} />
        </Button>
      </td>
    </tr>
  );
}
