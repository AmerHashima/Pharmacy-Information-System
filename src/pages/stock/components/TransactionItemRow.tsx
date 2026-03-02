import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { productService } from "@/api/productService";
import { ProductDto } from "@/types";

interface TransactionItemRowProps {
  index: number;
  remove: (index: number) => void;
  isRemoveDisabled: boolean;
  products: ProductDto[];
  setProducts: React.Dispatch<React.SetStateAction<ProductDto[]>>;
  debouncedFetchProducts: (search: string) => void;
}

export default function TransactionItemRow({
  index,
  remove,
  isRemoveDisabled,
  products,
  setProducts,
  debouncedFetchProducts,
}: TransactionItemRowProps) {
  const { t } = useTranslation("stock");
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode) return;
    try {
      const res = await productService.parseAndGetProduct({
        barcodeInput: barcode,
      });
      if (res.data.success && res.data.data?.productFound) {
        const prod = res.data.data.product;
        const barcodeData = res.data.data.barcodeData;

        // Ensure product is in our current options list
        if (prod && !products.find((p) => p.oid === prod.oid)) {
          setProducts((prev) => [...prev, prod]);
        }

        if (prod) {
          setValue(`details.${index}.productId`, prod.oid);
          setValue(`details.${index}.unitCost`, prod.price || 0);
        }

        if (barcodeData?.batchNumber) {
          setValue(`details.${index}.batchNumber`, barcodeData.batchNumber);
        }

        if (barcodeData?.expiryDate) {
          try {
            const formattedExpiry = new Date(barcodeData.expiryDate)
              .toISOString()
              .split("T")[0];
            setValue(`details.${index}.expiryDate`, formattedExpiry);
          } catch {
            setValue(`details.${index}.expiryDate`, barcodeData.expiryDate);
          }
        }

        toast.success("Product found via scanning");
      } else {
        toast.error(res.data.data?.productMessage || "Product not found");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("error_occurred"));
    }
  };

  const getProductOptions = () =>
    products.map((p) => ({
      value: p.oid,
      label: `${p.drugName} - ${p.gtin || ""}`,
    }));

  const itemErrors = (errors.details as any)?.[index];

  return (
    <tr className="bg-white">
      <td className="px-4 py-3">
        <Input
          placeholder={t("qrcode")}
          {...register(`details.${index}.qrcode`)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleBarcodeScan(watch(`details.${index}.qrcode`));
            }
          }}
        />
      </td>
      <td className="px-4 py-3">
        <Select
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
        />
      </td>

      <td className="px-4 py-3">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          onKeyDown={(e) => {
            if (["-", "e", "E"].includes(e.key)) e.preventDefault();
          }}
          error={itemErrors?.quantity?.message}
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
      <td className="px-4 py-3">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          onKeyDown={(e) => {
            if (["-", "e", "E"].includes(e.key)) e.preventDefault();
          }}
          error={itemErrors?.unitCost?.message}
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
      <td className="px-4 py-3">
        <Input
          placeholder={t("batch_placeholder")}
          {...register(`details.${index}.batchNumber`, {
            onChange: (e) => {
              setValue(`details.${index}.batchNumber`, e.target.value);
              trigger(`details.${index}.batchNumber`);
            },
          })}
        />
      </td>
      <td className="px-4 py-3">
        <Input
          type="date"
          {...register(`details.${index}.expiryDate`, {
            onChange: (e) => {
              setValue(`details.${index}.expiryDate`, e.target.value);
              trigger(`details.${index}.expiryDate`);
            },
          })}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => remove(index)}
          className="text-red-500 hover:text-red-700 p-1"
          disabled={isRemoveDisabled}
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}
