import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Edit2, Plus, ReceiptText, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { invoiceSetupService } from "@/api/invoiceSetupService";
import { lookupService } from "@/api/lookupService";
import { handleApiError } from "@/utils/handleApiError";
import {
  AppLookupDetailDto,
  CreateInvoiceSetupDto,
  InvoiceSetupDto,
  UpdateInvoiceSetupDto,
} from "@/types";

type InvoiceSetupRow = {
  oid?: string;
  nameAr: string;
  nameEn: string;
  format: string;
  numberValue: number;
  branchId: string;
  invoiceTypeId: string;
  invoiceTypeName?: string;
};

interface BranchInvoiceSetupTabProps {
  branchId?: string;
  isLoading?: boolean;
}

const normalizeRow = (row: InvoiceSetupDto): InvoiceSetupRow => ({
  oid: row.oid,
  nameAr: row.nameAr ?? "",
  nameEn: row.nameEn ?? "",
  format: row.format ?? "",
  numberValue: Number(row.numberValue ?? 0),
  branchId: row.branchId,
  invoiceTypeId: row.invoiceTypeId,
  invoiceTypeName: row.invoiceTypeName ?? "",
});

export default function BranchInvoiceSetupTab({
  branchId,
  isLoading = false,
}: BranchInvoiceSetupTabProps) {
  const [invoiceTypes, setInvoiceTypes] = useState<AppLookupDetailDto[]>([]);
  const [rows, setRows] = useState<InvoiceSetupRow[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [isAddingRow, setIsAddingRow] = useState(false);

  const [newRow, setNewRow] = useState<Omit<InvoiceSetupRow, "branchId" | "oid">>({
    nameAr: "",
    nameEn: "",
    format: "",
    numberValue: 0,
    invoiceTypeId: "",
    invoiceTypeName: "",
  });

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<InvoiceSetupRow | null>(null);

  const canManage = useMemo(() => !!branchId, [branchId]);

  const invoiceTypeOptions = useMemo(
    () =>
      invoiceTypes.map((x) => ({
        value: x.oid,
        label: x.valueNameEn || x.valueNameAr || x.lookupDetailCode,
      })),
    [invoiceTypes],
  );

  const getInvoiceTypeLabel = (invoiceTypeId: string, fallbackName?: string) => {
    const found = invoiceTypes.find((x) => x.oid === invoiceTypeId);
    return found?.valueNameEn || found?.valueNameAr || fallbackName || "-";
  };

  const fetchInvoiceTypes = async () => {
    try {
      const res = await lookupService.getByCode("INVOICE_TYPE", true);
      setInvoiceTypes(res.data.data?.lookupDetails || []);
    } catch (err) {
      handleApiError(err);
    }
  };

  const fetchBranchSetup = async () => {
    if (!branchId) return;
    setIsFetching(true);
    try {
      const res = await invoiceSetupService.getByBranch(branchId);
      const data = (res.data.data || []).map(normalizeRow);
      setRows(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchInvoiceTypes();
  }, []);

  useEffect(() => {
    fetchBranchSetup();
  }, [branchId]);

  const handleAddRow = async () => {
    if (!branchId) return;
    if (!newRow.invoiceTypeId) {
      toast.error("Invoice type is required");
      return;
    }
    if (!newRow.nameEn.trim()) {
      toast.error("Name EN is required");
      return;
    }

    setSavingRowId("new");
    try {
      const payload: CreateInvoiceSetupDto = {
        nameAr: newRow.nameAr,
        nameEn: newRow.nameEn,
        format: newRow.format,
        numberValue: Number(newRow.numberValue || 0),
        branchId,
        invoiceTypeId: newRow.invoiceTypeId,
      };

      const res = await invoiceSetupService.create(payload);
      const created = res.data.data ? normalizeRow(res.data.data) : null;
      if (created) {
        setRows((prev) => [...prev, created]);
      } else {
        await fetchBranchSetup();
      }

      setNewRow({
        nameAr: "",
        nameEn: "",
        format: "",
        numberValue: 0,
        invoiceTypeId: "",
        invoiceTypeName: "",
      });
      setIsAddingRow(false);
      toast.success("Invoice setup row added");
    } catch (err) {
      handleApiError(err);
    } finally {
      setSavingRowId(null);
    }
  };

  const startEdit = (row: InvoiceSetupRow) => {
    if (!row.oid) return;
    setIsAddingRow(false);
    setEditingRowId(row.oid);
    setEditingRow({ ...row });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditingRow(null);
  };

  const saveEdit = async () => {
    if (!branchId || !editingRow || !editingRowId) return;
    if (!editingRow.invoiceTypeId) {
      toast.error("Invoice type is required");
      return;
    }
    if (!editingRow.nameEn.trim()) {
      toast.error("Name EN is required");
      return;
    }

    setSavingRowId(editingRowId);
    try {
      const payload: UpdateInvoiceSetupDto = {
        oid: editingRowId,
        nameAr: editingRow.nameAr,
        nameEn: editingRow.nameEn,
        format: editingRow.format,
        numberValue: Number(editingRow.numberValue || 0),
        branchId,
        invoiceTypeId: editingRow.invoiceTypeId,
      };

      const res = await invoiceSetupService.update(payload);
      const updated = res.data.data ? normalizeRow(res.data.data) : editingRow;

      setRows((prev) =>
        prev.map((r) => (r.oid === editingRowId ? { ...r, ...updated } : r)),
      );
      cancelEdit();
      toast.success("Invoice setup row updated");
    } catch (err) {
      handleApiError(err);
    } finally {
      setSavingRowId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingRowId) return;

    setSavingRowId(deletingRowId);
    try {
      await invoiceSetupService.delete(deletingRowId);
      setRows((prev) => prev.filter((r) => r.oid !== deletingRowId));
      if (editingRowId === deletingRowId) {
        cancelEdit();
      }
      setDeletingRowId(null);
      toast.success("Invoice setup row deleted");
    } catch (err) {
      handleApiError(err);
    } finally {
      setSavingRowId(null);
    }
  };

  if (!canManage) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Complete branch creation first, then you can manage branch invoice setup.
      </div>
    );
  }

  const showEditor = isAddingRow || !!editingRow;
  const isEditingMode = !!editingRow;
  const editorRow = isEditingMode ? editingRow : newRow;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Invoice Setup</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage branch invoice numbering rules
            </p>
          </div>
        </div>

        {!showEditor && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingRowId(null);
              setEditingRow(null);
              setIsAddingRow(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Setup
          </Button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {showEditor && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => {
                setIsAddingRow(false);
                cancelEdit();
              }}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h4 className="text-lg font-bold text-gray-900 mb-6">
              {isEditingMode ? "Edit Invoice Setup" : "Add Invoice Setup"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Type*
                </label>
                <select
                  value={editorRow?.invoiceTypeId || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isEditingMode) {
                      setEditingRow((prev) =>
                        prev ? { ...prev, invoiceTypeId: value } : prev,
                      );
                    } else {
                      setNewRow((prev) => ({ ...prev, invoiceTypeId: value }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5"
                  disabled={isLoading}
                >
                  <option value="">Select type</option>
                  {invoiceTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name EN*
                </label>
                <input
                  type="text"
                  value={editorRow?.nameEn || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isEditingMode) {
                      setEditingRow((prev) =>
                        prev ? { ...prev, nameEn: value } : prev,
                      );
                    } else {
                      setNewRow((prev) => ({ ...prev, nameEn: value }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name AR
                </label>
                <input
                  type="text"
                  value={editorRow?.nameAr || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isEditingMode) {
                      setEditingRow((prev) =>
                        prev ? { ...prev, nameAr: value } : prev,
                      );
                    } else {
                      setNewRow((prev) => ({ ...prev, nameAr: value }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <input
                  type="text"
                  value={editorRow?.format || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isEditingMode) {
                      setEditingRow((prev) =>
                        prev ? { ...prev, format: value } : prev,
                      );
                    } else {
                      setNewRow((prev) => ({ ...prev, format: value }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number Value
                </label>
                <input
                  type="number"
                  min="0"
                  value={editorRow?.numberValue ?? 0}
                  onChange={(e) => {
                    const value = Number(e.target.value || 0);
                    if (isEditingMode) {
                      setEditingRow((prev) =>
                        prev ? { ...prev, numberValue: value } : prev,
                      );
                    } else {
                      setNewRow((prev) => ({ ...prev, numberValue: value }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsAddingRow(false);
                  cancelEdit();
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={isEditingMode ? saveEdit : handleAddRow}
                isLoading={
                  isEditingMode
                    ? savingRowId === editingRowId
                    : savingRowId === "new"
                }
                className="inline-flex items-center gap-1"
              >
                {!isEditingMode && <Plus className="h-4 w-4" />}
                {isEditingMode ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        )}

        {rows.length === 0 && !isFetching ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <div className="p-3 bg-white rounded-full shadow-sm mb-4">
              <ReceiptText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No invoice setup found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first invoice setup row</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Invoice Type
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Name EN
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Name AR
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Format
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[140px]">
                Number Value
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right w-[170px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isFetching ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                return (
                  <tr
                    key={row.oid || `${row.invoiceTypeId}-${row.nameEn}-${row.numberValue}`}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                          <ReceiptText className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {getInvoiceTypeLabel(row.invoiceTypeId, row.invoiceTypeName)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      <span className="font-medium">{row.nameEn || "-"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      <span>{row.nameAr || "-"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono text-sm">
                      <span>{row.format || "-"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-blue-600 font-bold">
                      <span>{row.numberValue}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 rtl:space-x-reverse">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(row)}
                        className="p-2"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => row.oid && setDeletingRowId(row.oid)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deletingRowId}
        onClose={() => setDeletingRowId(null)}
        onConfirm={handleDelete}
        title="Delete Invoice Setup"
        message="Are you sure you want to delete this invoice setup row?"
        variant="danger"
        isLoading={!!deletingRowId && savingRowId === deletingRowId}
      />
    </div>
  );
}
