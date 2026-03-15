import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Edit2, Trash2, Search as SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RoleForm from "./RoleForm";
import { roleService } from "@/api/roleService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { RoleDto, FilterOperation } from "@/types";

export default function RolesPage() {
  const { t } = useTranslation("roles");
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<RoleDto>({
    service: roleService.query,
    pageSize: 10,
  });

  const loadData = useCallback(() => {
    const filters = searchTerm
      ? [
          {
            propertyName: "Name",
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

  const handleCreateOrUpdate = async (formData: any) => {
    setIsActionLoading(true);
    try {
      if (selectedRole) {
        await roleService.update(selectedRole.oid, {
          ...formData,
          oid: selectedRole.oid,
        });
        toast.success(t("roleUpdated"));
      } else {
        await roleService.create(formData);
        toast.success(t("roleCreated"));
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setIsActionLoading(true);
    try {
      await roleService.delete(selectedRole.oid);
      toast.success(t("roleDeleted"));
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
      header: t("roleName"),
      accessorKey: "name",
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{info.getValue()}</span>
            <span className="text-xs text-gray-400 font-medium">
              {info.row.original.description || "---"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: tc("createdAt"),
      accessorKey: "createdAt",
      cell: (info: any) => (
        <span className="text-sm text-gray-500">
          {info.getValue()
            ? new Date(info.getValue()).toLocaleDateString()
            : "---"}
        </span>
      ),
    },
    {
      header: tc("actions"),
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRole(info.row.original);
              setIsFormOpen(true);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRole(info.row.original);
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
    <div className="max-w-full mx-auto space-y-6">
      <PageHeader
        title={t("title")}
        onAddClick={() => {
          setSelectedRole(null);
          setIsFormOpen(true);
        }}
        addLabel={t("addRole")}
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("searchPlaceholder")}
        />
        <div className="text-sm text-gray-500 font-medium">
          {t("totalRoles")}:{" "}
          <span className="text-gray-900">{totalRecords}</span>
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

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedRole ? t("editRole") : t("addRole")}
      >
        <RoleForm
          initialData={selectedRole}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteRole")}
        message={tc("deleteConfirm")}
        isLoading={isActionLoading}
      />
    </div>
  );
}
