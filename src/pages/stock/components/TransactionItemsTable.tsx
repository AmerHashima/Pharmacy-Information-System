import { Plus, Search, ScanLine } from "lucide-react";
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
  /** Called when the user scrolls to the bottom of the product dropdown. */
  onLoadMoreProducts: () => void;
  /** Whether more product pages are available on the server. */
  productsHasMore: boolean;
  /** True while the next page of products is in-flight. */
  isLoadingMoreProducts: boolean;
}

export default function TransactionItemsTable({
  products,
  setProducts,
  debouncedFetchProducts,
  onLoadMoreProducts,
  productsHasMore,
  isLoadingMoreProducts,
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
  const [isScanning, setIsScanning] = useState(false);

  const handleGlobalBarcodeScan = async (barcode: string) => {
    if (!barcode || isScanning) return;
    setIsScanning(true);
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
    } finally {
      setIsScanning(false);
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
    <Card className="overflow-visible min-h-[400px] border-none shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
        {/* <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Plus size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{t("items")}</h2>
        </div> */}

        <div className="flex flex-1 flex-col sm:flex-row items-stretch gap-3 w-full max-w-2xl">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-500">
                <ScanLine className="h-5 w-5" />
              </div>
              <Input
                placeholder={t("qrcode") || "Scan barcode"}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                disabled={isScanning}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGlobalBarcodeScan(barcodeInput);
                  }
                }}
                autoFocus
                className={`pl-10  text-lg border-green-200 focus:ring-green-500 bg-green-50/30 transition-opacity ${
                  isScanning ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>
          <div className="flex-1">
            <Select
              options={products.map((p) => ({
                value: p.oid,
                label: `${p.drugName} - ${p.gtin || ""}`,
              }))}
              searchPlaceholder={t("search_product") || "Search by name"}
              onSearchChange={debouncedFetchProducts}
              // ── Pagination ──────────────────────────────────────────────
              onLoadMore={onLoadMoreProducts}
              hasMore={productsHasMore}
              isLoadingMore={isLoadingMoreProducts}
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
              className="bg-white border-gray-200"
            />
          </div>

          <Button
            type="button"
            variant="primary"
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
            className="flex items-center justify-center gap-2 px-6 shadow-sm shadow-blue-200 active:scale-95 transition-transform"
          >
            <Plus size={18} />
            <span className="whitespace-nowrap">{t("add_item")}</span>
          </Button>
        </div>
      </div>

      <div
        className="overflow-x-auto overflow-y-visible min-h-[300px]"
        onKeyDown={handleKeyDown}
      >
        <table className="w-full text-sm text-left border-separate border-spacing-0">
          <thead className="bg-gray-50/80 sticky top-0 z-10">
            <tr>
              <th className="px-5 py-4 font-bold text-gray-600 border-b border-gray-100 first:rounded-tl-lg">
                {t("product")}
              </th>
              <th className="px-5 py-4 font-bold text-gray-600 border-b border-gray-100 w-32">
                {t("quantity")}
              </th>
              <th className="px-5 py-4 font-bold text-gray-600 border-b border-gray-100 w-32">
                {t("unit_cost")}
              </th>
              <th className="px-5 py-4 font-bold text-gray-600 border-b border-gray-100 w-48">
                {t("batch_number")}
              </th>
              <th className="px-5 py-4 font-bold text-gray-600 border-b border-gray-100 w-48">
                {t("expiry_date")}
              </th>
              <th className="px-5 py-4 font-bold text-gray-600 border-b border-gray-100 w-20 last:rounded-tr-lg"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {fields.map((field, index) => (
              <TransactionItemRow
                key={field.id}
                index={index}
                remove={remove}
                isRemoveDisabled={fields.length === 1}
                products={products}
                setProducts={setProducts}
                debouncedFetchProducts={debouncedFetchProducts}
                // ── Pagination ────────────────────────────────────────────
                onLoadMoreProducts={onLoadMoreProducts}
                productsHasMore={productsHasMore}
                isLoadingMoreProducts={isLoadingMoreProducts}
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
