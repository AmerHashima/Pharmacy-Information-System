import { Plus } from "lucide-react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TransactionItemRow from "./TransactionItemRow";
import { ProductDto } from "@/types";
import { productService } from "@/api/productService";

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
  const { t, i18n } = useTranslation("stock");
  const isRtl = i18n.dir() === "rtl";
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const [barcodeInput, setBarcodeInput] = useState("");

  const handleGlobalBarcodeScan = async (barcode: string) => {
    if (!barcode) return;
    try {
      const res = await productService.parseAndGetProduct({
        barcodeInput: barcode,
      });
      if (res.data.success && res.data.data?.productFound) {
        const prod = res.data.data.product;
        const barcodeData = res.data.data.barcodeData;

        if (prod && !products.find((p) => p.oid === prod.oid)) {
          setProducts((prev) => [...prev, prod]);
        }

        let expiryDate = "";
        if (barcodeData?.expiryDate) {
          try {
            expiryDate = new Date(barcodeData.expiryDate)
              .toISOString()
              .split("T")[0];
          } catch {
            expiryDate = barcodeData.expiryDate;
          }
        }

        append({
          qrcode: barcode,
          productId: prod?.oid || "",
          quantity: 1,
          unitCost: prod?.price || 0,
          batchNumber: barcodeData?.batchNumber || "",
          expiryDate: expiryDate,
        });

        toast.success(t("product_added") || "Product added via scanning");
        setBarcodeInput("");
      } else {
        toast.error(res.data.data?.productMessage || "Product not found");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("error_occurred"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput =
      target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.getAttribute("role") === "button";

    if (!isInput) return;

    const row = parseInt(target.getAttribute("data-row") || "-1");
    const col = parseInt(target.getAttribute("data-col") || "-1");

    if (row === -1 || col === -1) return;

    let nextRow = row;
    let nextCol = col;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        nextRow = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        nextRow = Math.min(fields.length - 1, row + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        nextCol = isRtl ? Math.min(4, col + 1) : Math.max(0, col - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        nextCol = isRtl ? Math.max(0, col - 1) : Math.min(4, col + 1);
        break;
      default:
        return;
    }

    if (nextRow !== row || nextCol !== col) {
      const nextElement = document.querySelector(
        `[data-row="${nextRow}"][data-col="${nextCol}"]`,
      ) as HTMLElement;
      nextElement?.focus();
    }
  };

  return (
    <Card className="overflow-visible min-h-[400px]">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-lg font-semibold whitespace-nowrap">
          {t("items")}
        </h2>

        <div className="flex-1 max-w-md">
          <Input
            placeholder={t("qrcode") || "Scan barcode"}
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleGlobalBarcodeScan(barcodeInput);
              }
            }}
            autoFocus
          />
        </div>
        <div className="flex-1 max-w-md">
          <Select
            options={products.map((p) => ({
              value: p.oid,
              label: `${p.drugName} - ${p.gtin || ""}`,
            }))}
            searchPlaceholder={t("search_product") || "Search by name"}
            onSearchChange={debouncedFetchProducts}
            onChange={(e) => {
              const prod = products.find((p) => p.oid === e.target.value);
              if (prod) {
                append({
                  productId: prod.oid,
                  qrcode: "",
                  quantity: 1,
                  unitCost: prod.price || 0,
                  batchNumber: "",
                  expiryDate: "",
                });
              }
            }}
            value=""
          />
        </div>

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

      <div
        className="overflow-x-auto overflow-y-visible min-h-[300px]"
        onKeyDown={handleKeyDown}
      >
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
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
