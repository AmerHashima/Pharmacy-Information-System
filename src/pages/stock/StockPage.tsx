import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeftRight,
  Download,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import { useLookup } from "@/context/LookupContext";
import { branchService } from "@/api/branchService";
import { stakeholderService } from "@/api/stakeholderService";
import { productService } from "@/api/productService";
import { stockService } from "@/api/stockService";
import {
  BranchDto,
  StakeholderDto,
  ProductDto,
  CreateStockTransactionDto,
  StockTransactionDetailDto,
} from "@/types";

export default function StockPage() {
  const { t, i18n } = useTranslation("stock");
  const { getLookupDetails } = useLookup();
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [suppliers, setSuppliers] = useState<StakeholderDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const transactionTypes = getLookupDetails("TRANSACTION_TYPE");

  const schema = z
    .object({
      transactionTypeId: z.string().min(1, t("transaction_type_required")),
      fromBranchId: z.string().optional(),
      toBranchId: z.string().optional(),
      supplierId: z.string().optional(),
      referenceNumber: z.string().optional(),
      notes: z.string().optional(),
      transactionDate: z.string().min(1, t("date_required")),
      details: z
        .array(
          z.object({
            productId: z.string().min(1, t("product_required")),
            quantity: z.number().min(0.01, t("quantity_min")),
            unitCost: z.number().min(0),
            batchNumber: z.string().optional(),
            expiryDate: z.string().optional(),
            notes: z.string().optional(),
          }),
        )
        .min(1, t("at_least_one_item")),
    })
    .refine(
      (data) => {
        // Validation based on transaction type if needed
        return true;
      },
      { message: "Invalid transaction configuration" },
    );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionDate: new Date().toISOString().split("T")[0],
      details: [{ productId: "", quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const selectedTypeId = watch("transactionTypeId");
  const selectedType = transactionTypes.find(
    (type) => type.oid === selectedTypeId,
  );
  const typeCode = selectedType?.lookupDetailCode;

  const fetchProducts = async (search?: string) => {
    try {
      const res = await productService.query({
        request: {
          pagination: { pageNumber: 1, pageSize: 50 },
          filters: search
            ? [{ propertyName: "drugName", value: search, operation: 2 }] // Contains
            : [],
        },
      });
      if (res.data.success && res.data.data) {
        setProducts(res.data.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, sRes] = await Promise.all([
          branchService.getAll(),
          stakeholderService.getAll({ stakeholderTypeCode: "SUPPLIER" }),
        ]);
        if (bRes.data.success) setBranches(bRes.data.data);
        if (sRes.data.success) setSuppliers(sRes.data.data);
        await fetchProducts();
      } catch (err) {
        console.error("Failed to fetch dependencies", err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const dto: CreateStockTransactionDto = {
        ...data,
        status: "PENDING",
        details: data.details.map((d, index) => ({
          ...d,
          lineNumber: index + 1,
          totalCost: d.quantity * d.unitCost,
        })),
      };

      const res = await stockService.createStockTransaction(dto);
      if (res.data.success) {
        toast.success(t("transaction_created_success"));
        reset();
      } else {
        toast.error(res.data.message || t("transaction_failed"));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("error_occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const getProductOptions = () =>
    products.map((p) => ({
      value: p.oid,
      label: `${p.drugName} - ${p.gtin || ""}`,
    }));

  const getBranchOptions = () =>
    branches.map((b) => ({
      value: b.oid,
      label: b.branchName,
    }));

  const getSupplierOptions = () =>
    suppliers.map((s) => ({
      value: s.oid,
      label: s.name,
    }));

  const getTransactionTypeOptions = () =>
    transactionTypes.map((t) => ({
      value: t.oid,
      label:
        i18n.language === "ar"
          ? t.valueNameAr || t.valueNameEn || ""
          : t.valueNameEn || "",
    }));

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <div className="flex gap-2">
          {typeCode === "STOCK_IN" && <Download className="text-green-600" />}
          {typeCode === "STOCK_OUT" && <Upload className="text-red-600" />}
          {typeCode === "TRANSFER" && (
            <ArrowLeftRight className="text-blue-600" />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="overflow-visible h-fit">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label={t("transaction_type")}
              options={getTransactionTypeOptions()}
              error={errors.transactionTypeId?.message}
              {...register("transactionTypeId")}
            />

            <Input
              type="date"
              label={t("transaction_date")}
              error={errors.transactionDate?.message}
              {...register("transactionDate")}
            />

            <Input
              label={t("reference_number")}
              error={errors.referenceNumber?.message}
              {...register("referenceNumber")}
            />

            {(typeCode === "STOCK_IN" || typeCode === "TRANSFER") && (
              <Select
                label={t("to_branch")}
                options={getBranchOptions()}
                error={errors.toBranchId?.message}
                {...register("toBranchId")}
              />
            )}

            {(typeCode === "STOCK_OUT" || typeCode === "TRANSFER") && (
              <Select
                label={t("from_branch")}
                options={getBranchOptions()}
                error={errors.fromBranchId?.message}
                {...register("fromBranchId")}
              />
            )}

            {typeCode === "STOCK_IN" && (
              <Select
                label={t("supplier")}
                options={getSupplierOptions()}
                error={errors.supplierId?.message}
                {...register("supplierId")}
              />
            )}
          </div>

          <div className="mt-4">
            <Input
              label={t("notes")}
              error={errors.notes?.message}
              {...register("notes")}
            />
          </div>
        </Card>

        <Card className="overflow-visible min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t("items")}</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({ productId: "", quantity: 1, unitCost: 0 })
              }
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              {t("add_item")}
            </Button>
          </div>

          <div className="overflow-visible">
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
                  <tr key={field.id} className="bg-white">
                    <td className="px-4 py-3">
                      <Select
                        options={getProductOptions()}
                        error={errors.details?.[index]?.productId?.message}
                        {...register(`details.${index}.productId`)}
                        onChange={(e) => {
                          const prod = products.find(
                            (p) => p.oid === e.target.value,
                          );
                          if (prod) {
                            setValue(
                              `details.${index}.unitCost`,
                              prod.price || 0,
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "E") {
                            e.preventDefault();
                          }
                        }}
                        error={errors.details?.[index]?.quantity?.message}
                        {...register(`details.${index}.quantity`, {
                          valueAsNumber: true,
                          min: 0,
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
                          if (e.key === "-" || e.key === "e" || e.key === "E") {
                            e.preventDefault();
                          }
                        }}
                        error={errors.details?.[index]?.unitCost?.message}
                        {...register(`details.${index}.unitCost`, {
                          valueAsNumber: true,
                          min: 0,
                        })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        placeholder={t("batch_placeholder")}
                        {...register(`details.${index}.batchNumber`)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="date"
                        {...register(`details.${index}.expiryDate`)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={fields.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.details?.root && (
            <p className="mt-2 text-sm text-red-500">
              {errors.details.root.message}
            </p>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => reset()}>
            {t("clear")}
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            {t("save_transaction")}
          </Button>
        </div>
      </form>
    </div>
  );
}
