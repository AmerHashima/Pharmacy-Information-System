import { Trash2 } from "lucide-react";
import { useEffect } from "react";
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
  onLoadMoreProducts: () => void;
  productsHasMore: boolean;
  isLoadingMoreProducts: boolean;
  isViewMode?: boolean;
  showPricingDetails?: boolean;
}

const clampDiscount = (value: number) => Math.min(Math.max(value, 0), 100);

const calculateUnitCost = (
  productPrice?: number,
  discountPercentOne?: number,
  discountPercentTwo?: number,
) => {
  const basePrice = Number(productPrice || 0);
  const firstDiscount = clampDiscount(Number(discountPercentOne || 0));
  const secondDiscount = clampDiscount(Number(discountPercentTwo || 0));

  const afterFirstDiscount =
    firstDiscount > 0 ? basePrice * (1 - firstDiscount / 100) : basePrice;

  return secondDiscount > 0
    ? afterFirstDiscount * (1 - secondDiscount / 100)
    : afterFirstDiscount;
};

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
  isViewMode = false,
  showPricingDetails = false,
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
  const productId = watch(`details.${index}.productId`);
  const productPrice = watch(`details.${index}.productPrice`);
  const discountPercentOne = watch(`details.${index}.discountPercentOne`);
  const discountPercentTwo = watch(`details.${index}.discountPercentTwo`);
  const selectedProduct = products.find((p) => p.oid === productId);

  useEffect(() => {
    if (!showPricingDetails || isViewMode || !selectedProduct) return;

    if ((productPrice ?? 0) === 0 && selectedProduct.price != null) {
      setValue(`details.${index}.productPrice`, selectedProduct.price, {
        shouldValidate: true,
      });
    }

    if (
      (discountPercentOne ?? 0) === 0 &&
      selectedProduct.discountPercentSupplierOne
    ) {
      setValue(
        `details.${index}.discountPercentOne`,
        selectedProduct.discountPercentSupplierOne,
        { shouldValidate: true },
      );
    }

    if (
      (discountPercentTwo ?? 0) === 0 &&
      selectedProduct.discountPercentSupplierTwo
    ) {
      setValue(
        `details.${index}.discountPercentTwo`,
        selectedProduct.discountPercentSupplierTwo,
        { shouldValidate: true },
      );
    }
  }, [
    discountPercentOne,
    discountPercentTwo,
    index,
    isViewMode,
    productPrice,
    selectedProduct,
    setValue,
    showPricingDetails,
  ]);

  useEffect(() => {
    if (!showPricingDetails) return;

    setValue(
      `details.${index}.unitCost`,
      calculateUnitCost(productPrice, discountPercentOne, discountPercentTwo),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  }, [
    discountPercentOne,
    discountPercentTwo,
    index,
    productPrice,
    setValue,
    showPricingDetails,
  ]);

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
                const nextProductPrice = prod.price || 0;
                const nextDiscountOne = prod.discountPercentSupplierOne || 0;
                const nextDiscountTwo = prod.discountPercentSupplierTwo || 0;

                if (showPricingDetails) {
                  setValue(`details.${index}.productPrice`, nextProductPrice);
                  setValue(`details.${index}.discountPercentOne`, nextDiscountOne);
                  setValue(`details.${index}.discountPercentTwo`, nextDiscountTwo);
                  setValue(
                    `details.${index}.unitCost`,
                    calculateUnitCost(
                      nextProductPrice,
                      nextDiscountOne,
                      nextDiscountTwo,
                    ),
                  );
                } else {
                  setValue(`details.${index}.unitCost`, nextProductPrice);
                }

                trigger(`details.${index}.unitCost`);
              }
              trigger(`details.${index}.productId`);
            },
          })}
          onSearchChange={debouncedFetchProducts}
          onLoadMore={onLoadMoreProducts}
          hasMore={productsHasMore}
          isLoadingMore={isLoadingMoreProducts}
          disabled={isViewMode}
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
          disabled={isViewMode}
          className="bg-transparent border-gray-200 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed"
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

      {showPricingDetails && (
        <>
          <td className="px-5 py-3">
            <Input
              data-row={index}
              data-col={2}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={watch(`details.${index}.productPrice`) ?? 0}
              onKeyDown={(e) => {
                if (["-", "e", "E"].includes(e.key)) e.preventDefault();
              }}
              disabled={isViewMode}
              className="bg-transparent border-gray-200 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              {...register(`details.${index}.productPrice`, {
                valueAsNumber: true,
                min: 0,
                onChange: (e) => {
                  setValue(
                    `details.${index}.productPrice`,
                    parseFloat(e.target.value) || 0,
                  );
                },
              })}
            />
          </td>
          <td className="px-5 py-3">
            <Input
              data-row={index}
              data-col={3}
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0.00"
              value={watch(`details.${index}.discountPercentOne`) ?? 0}
              onKeyDown={(e) => {
                if (["-", "e", "E"].includes(e.key)) e.preventDefault();
              }}
              disabled={isViewMode}
              className="bg-transparent border-gray-200 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              {...register(`details.${index}.discountPercentOne`, {
                valueAsNumber: true,
                min: 0,
                max: 100,
                onChange: (e) => {
                  setValue(
                    `details.${index}.discountPercentOne`,
                    clampDiscount(parseFloat(e.target.value) || 0),
                  );
                },
              })}
            />
          </td>
          <td className="px-5 py-3">
            <Input
              data-row={index}
              data-col={4}
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0.00"
              value={watch(`details.${index}.discountPercentTwo`) ?? 0}
              onKeyDown={(e) => {
                if (["-", "e", "E"].includes(e.key)) e.preventDefault();
              }}
              disabled={isViewMode}
              className="bg-transparent border-gray-200 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              {...register(`details.${index}.discountPercentTwo`, {
                valueAsNumber: true,
                min: 0,
                max: 100,
                onChange: (e) => {
                  setValue(
                    `details.${index}.discountPercentTwo`,
                    clampDiscount(parseFloat(e.target.value) || 0),
                  );
                },
              })}
            />
          </td>
        </>
      )}

      <td className="px-5 py-3">
        <Input
          data-row={index}
          data-col={showPricingDetails ? 5 : 2}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={watch(`details.${index}.unitCost`)}
          onKeyDown={(e) => {
            if (["-", "e", "E"].includes(e.key)) e.preventDefault();
          }}
          error={itemErrors?.unitCost?.message}
          disabled={isViewMode}
          readOnly={showPricingDetails}
          className="bg-transparent border-gray-200 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          {...register(`details.${index}.unitCost`, {
            valueAsNumber: true,
            min: 0,
            onChange: showPricingDetails
              ? undefined
              : (e) => {
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
          data-col={showPricingDetails ? 6 : 3}
          placeholder={t("batch_placeholder")}
          value={watch(`details.${index}.batchNumber`)}
          disabled={isViewMode}
          className="bg-transparent border-gray-200 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed"
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
          data-col={showPricingDetails ? 7 : 4}
          type="date"
          value={watch(`details.${index}.expiryDate`)}
          disabled={isViewMode}
          className="bg-transparent border-gray-200 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          {...register(`details.${index}.expiryDate`, {
            onChange: (e) => {
              setValue(`details.${index}.expiryDate`, e.target.value);
              trigger(`details.${index}.expiryDate`);
            },
          })}
        />
      </td>
      <td className="px-5 py-3 text-right">
        {!isViewMode && (
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
        )}
      </td>
    </tr>
  );
}
