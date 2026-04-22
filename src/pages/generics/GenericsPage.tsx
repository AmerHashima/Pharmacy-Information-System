import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Pill, Search as SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { genericNameService } from "@/api/genericNameService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { GenericNameDto, FilterOperation } from "@/types";

export default function GenericsPage() {
  const { t } = useTranslation("generics");
  const tc = useTranslation("common").t;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGeneric, setSelectedGeneric] = useState<GenericNameDto | null>(
    null,
  );
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { data, isLoading, pageNumber, setPageNumber, totalPages, fetch } =
    useQueryTable<GenericNameDto>({
      service: genericNameService.query,
      pageSize: 10,
    });

  const loadData = useCallback(() => {
    const filters = searchTerm
      ? [
          {
            propertyName: "nameEN",
            value: searchTerm,
            operation: FilterOperation.Contains,
          },
          // {
          //   propertyName: "nameAR",
          //   value: searchTerm,
          //   operation: FilterOperation.Contains,
          // },
        ]
      : [];
    fetch("", filters);
  }, [fetch, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, pageNumber]);

  const handleDelete = async () => {
    if (!selectedGeneric) return;
    setIsActionLoading(true);
    try {
      await genericNameService.delete(selectedGeneric.oid);
      toast.success(t("genericDeleted"));
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: t("nameEN"),
      accessorKey: "nameEN",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <Pill className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gray-900">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: t("nameAR"),
      accessorKey: "nameAR",
      cell: (info: any) =>
        info.getValue() || <span className="text-gray-400">---</span>,
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
              navigate(`/generics/edit/${info.row.original.oid}`);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedGeneric(info.row.original);
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
        title={t("title")}
        onAddClick={() => {
          navigate("/generics/new");
        }}
        addLabel={t("addGeneric")}
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("searchPlaceholder")}
        />
        <div className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{data.length}</span>{" "}
          generics
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
        title={t("deleteGeneric")}
        message={t("deleteConfirm")}
        isLoading={isActionLoading}
      />
    </div>
  );
}
