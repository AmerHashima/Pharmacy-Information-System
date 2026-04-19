import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, FileText, Search as SearchIcon, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { invoiceShapeService } from "@/api/invoiceShapeService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { InvoiceShapeDto, FilterOperation } from "@/types";
import { useNavigate } from "react-router-dom";

export default function InvoiceShapesPage() {
  const { t } = useTranslation("sidebar");
  const tc = useTranslation("common").t;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState<InvoiceShapeDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { data, isLoading, pageNumber, setPageNumber, totalPages, fetch } =
    useQueryTable<InvoiceShapeDto>({
      service: invoiceShapeService.query,
      pageSize: 10,
    });

  const loadData = useCallback(() => {
    const filters = searchTerm
      ? [
          {
            propertyName: "shapeName",
            value: searchTerm,
            operation: FilterOperation.Contains,
          },
        ]
      : [];
    fetch("", filters);
  }, [fetch, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, pageNumber]);

  const handleDelete = async () => {
    if (!selectedShape) return;
    setIsActionLoading(true);
    try {
      const res = await invoiceShapeService.delete(selectedShape.oid);
      if (res.data.success) {
        toast.success("Invoice template deleted successfully");
        setIsDeleteOpen(false);
        loadData();
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Template Name",
      accessorKey: "shapeName",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gray-900">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: "Branch",
      accessorKey: "branchName",
      cell: (info: any) => info.getValue() || <span className="text-gray-400 italic">Global</span>,
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (info: any) => (
        <Badge variant={info.getValue() ? "success" : "default"}>
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Default",
      accessorKey: "defaultPrint",
      cell: (info: any) => (
        <Badge variant={info.getValue() ? "success" : "default"}>
          {info.getValue() ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: tc("actions"),
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate(`/invoice-builder/edit/${info.row.original.oid}`);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedShape(info.row.original);
              setIsDeleteOpen(true);
            }}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Templates"
        onAddClick={() => {
          navigate("/invoice-builder/new");
        }}
        addLabel="Add Template"
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search templates..."
        />
        <div className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{data.length}</span>{" "}
          templates
        </div>
      </div>

      <div className="space-y-4">
        <Table columns={columns} data={data} isLoading={isLoading} />
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
        />
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="Are you sure you want to delete this invoice template? This action cannot be undone."
        isLoading={isActionLoading}
      />
    </div>
  );
}
