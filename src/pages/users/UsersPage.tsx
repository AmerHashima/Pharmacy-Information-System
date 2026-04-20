import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Edit2,
  Trash2,
  Mail,
  Shield,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react";
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
import UserForm from "./UserForm";
import { systemUserService } from "@/api/systemUserService";
import { handleApiError } from "@/utils/handleApiError";
import { SystemUserDto } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { usePaginatedUsers } from "@/hooks/queries/useUsers";
import { queryKeys } from "@/hooks/queries/queryKeys";

export default function UsersPage() {
  const { t } = useTranslation("users");
  const tc = useTranslation("common").t;
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUserDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Only reset to page 1 if search term actually changed and is not first render
      if (debouncedSearchTerm !== searchTerm) {
        setPageNumber(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, debouncedSearchTerm]);

  const { data: pagedData, isLoading } = usePaginatedUsers(
    pageNumber,
    debouncedSearchTerm,
  );

  const data = pagedData?.data || [];
  const totalPages = pagedData?.totalPages || 1;
  const totalRecords = pagedData?.totalRecords || 0;

  const sanitizePayload = (data: any, isUpdate = false) => {
    const payload = { ...data };
    if (!payload.genderLookupId) payload.genderLookupId = null;
    if (!payload.birthDate) payload.birthDate = null;
    if (!payload.middleName) payload.middleName = null;
    if (!payload.mobile) payload.mobile = null;
    if (!payload.email) payload.email = null;
    if (!payload.defaultBranchId) payload.defaultBranchId = null;
    if (isUpdate && !payload.password) {
      delete payload.password;
    }
    return payload;
  };

  const handleCreateOrUpdate = async (formData: any) => {
    setIsActionLoading(true);
    try {
      if (selectedUser) {
        const payload = sanitizePayload(formData, true);
        await systemUserService.update(selectedUser.oid, {
          ...payload,
          oid: selectedUser.oid,
        });
        toast.success(t("userUpdated"));
      } else {
        const payload = sanitizePayload(formData, false);
        await systemUserService.create(payload);
        toast.success(t("userCreated"));
      }
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await systemUserService.delete(selectedUser.oid);
      toast.success(t("userDeleted"));
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: t("user"),
      accessorKey: "fullName",
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {info.getValue()?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{info.getValue()}</span>
            <span className="text-xs text-gray-400 font-medium tracking-tight">
              @{info.row.original.username}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("role"),
      accessorKey: "roleName",
      cell: (info: any) => (
        <Badge className="bg-purple-50 text-purple-700 border border-purple-100">
          <Shield className="h-3 w-3 mr-1" />
          {info.getValue()}
        </Badge>
      ),
    },
    {
      header: t("branch"),
      accessorKey: "defaultBranchName",
      cell: (info: any) => (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <MapPin className="h-3.5 w-3.5" />
          {info.getValue() || t("universalAccess")}
        </div>
      ),
    },
    // {
    //   header: t("defaultBranch", "Default Branch"),
    //   accessorKey: "defaultBranchName",
    //   cell: (info: any) => (
    //     <div className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
    //       <MapPin className="h-3.5 w-3.5" />
    //       {info.getValue() || "---"}
    //     </div>
    //   ),
    // },
    {
      header: t("email"),
      accessorKey: "email",
      cell: (info: any) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Mail className="h-3 w-3" />
          {info.getValue() || "---"}
        </div>
      ),
    },
    {
      header: t("lastLogin"),
      accessorKey: "lastLogin",
      cell: (info: any) => {
        const val = info.getValue();
        if (!val) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {new Date(val).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        );
      },
    },
    {
      header: t("failedLogins"),
      accessorKey: "failedLoginCount",
      cell: (info: any) => {
        const count = info.getValue() ?? 0;
        if (count === 0) return <span className="text-gray-400">0</span>;
        return (
          <div className="flex items-center gap-1.5 text-orange-600 text-sm font-medium">
            <AlertTriangle className="h-3 w-3" />
            {count}
          </div>
        );
      },
    },
    {
      header: tc("status"),
      accessorKey: "status",
      cell: (info: any) => (
        <Badge variant={info.getValue() === 1 ? "success" : "danger"}>
          {info.getValue() === 1 ? tc("active") : tc("inactive")}
        </Badge>
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
              setSelectedUser(info.row.original);
              setIsFormOpen(true);
            }}
            className="text-blue-600 h-8 w-8 p-0 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(info.row.original);
              setIsDeleteOpen(true);
            }}
            className="text-red-600 h-8 w-8 p-0 hover:bg-red-50"
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
          setSelectedUser(null);
          setIsFormOpen(true);
        }}
        addLabel={t("addUser")}
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("searchPlaceholder")}
        />
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          {t("globalAccounts")}:{" "}
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
        title={selectedUser ? t("editUser") : t("addUser")}
        size="lg"
      >
        <UserForm
          initialData={selectedUser}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteUser")}
        message={tc("deleteConfirm")}
        isLoading={isActionLoading}
      />
    </div>
  );
}
