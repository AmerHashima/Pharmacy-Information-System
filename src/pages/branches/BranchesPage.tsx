import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, MapPin, Search as SearchIcon, Upload, Image as ImageIcon, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { branchService } from "@/api/branchService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { BranchDto, FilterOperation } from "@/types";
import { useNavigate } from "react-router-dom";

export default function BranchesPage() {
  const { t } = useTranslation("branches");
  const tc = useTranslation("common").t;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://50.6.228.16:4000";

  const { data, isLoading, pageNumber, setPageNumber, totalPages, fetch } =
    useQueryTable<BranchDto>({
      service: branchService.query,
      pageSize: 10,
    });

  const loadData = useCallback(() => {
    // Specifically targeting branchName for search as per SOP
    const filters = searchTerm
      ? [
          {
            propertyName: "branchName",
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
    if (!selectedBranch) return;
    setIsActionLoading(true);
    try {
      await branchService.delete(selectedBranch.oid);
      toast.success(t("branchDeleted"));
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, branchId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsActionLoading(true);
    try {
      const res = await branchService.uploadLogo(branchId, file);
      if (res.success) {
        toast.success(t("logoUploaded", { defaultValue: "Logo uploaded successfully" }));
        loadData();
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogoDelete = async () => {
    if (!selectedBranch) return;
    setIsActionLoading(true);
    try {
      const res = await branchService.deleteLogo(selectedBranch.oid);
      if (res.success) {
        toast.success(t("logoDeleted", { defaultValue: "Logo deleted successfully" }));
        setIsLogoModalOpen(false);
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
      header: t("logo", { defaultValue: "Logo" }),
      id: "logo",
      cell: (info: any) => {
        const branch = info.row.original;
        return (
          <div className="flex items-center justify-center">
            {branch.logoImage ? (
              <div
                className="relative group cursor-pointer"
                onClick={() => {
                  setSelectedBranch(branch);
                  setIsLogoModalOpen(true);
                }}
              >
                <img
                  src={API_BASE_URL + branch.logoImage}
                  alt="Logo"
                  className="h-10 w-10 rounded-lg object-cover border border-gray-200 shadow-sm transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            ) : (
              <label className="cursor-pointer p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-400 transition-colors border-2 border-dashed border-gray-200 hover:border-blue-200">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, branch.oid)}
                  disabled={isActionLoading}
                />
              </label>
            )}
          </div>
        );
      },
    },
    {
      header: t("branchCode"),
      accessorKey: "branchCode",
      cell: (info: any) =>
        info.getValue() || (
          <span className="text-gray-400 italic">No code</span>
        ),
    },
    {
      header: t("branchName"),
      accessorKey: "branchName",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gray-900">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: t("city"),
      accessorFn: (row: BranchDto) =>
        `${row.city || ""}${row.city && row.district ? ", " : ""}${
          row.district || ""
        }`,
      cell: (info: any) =>
        info.getValue() || <span className="text-gray-400">---</span>,
    },
    // {
    //   header: "Users",
    //   accessorKey: "userCount",
    //   cell: (info: any) => (
    //     <Badge
    //       variant="default"
    //       className="bg-purple-50 text-purple-700 border border-purple-100"
    //     >
    //       {info.getValue()} Users
    //     </Badge>
    //   ),
    // },
    // {
    //   header: "Stock",
    //   accessorKey: "stockCount",
    //   cell: (info: any) => (
    //     <Badge
    //       variant="default"
    //       className="bg-green-50 text-green-700 border border-green-100"
    //     >
    //       {info.getValue()} Items
    //     </Badge>
    //   ),
    // },
    // {
    //   header: "Status",
    //   accessorKey: "status",
    //   cell: (info: any) => (
    //     <Badge variant={info.getValue() === 1 ? "success" : "danger"}>
    //       {info.getValue() === 1 ? "Active" : "Inactive"}
    //     </Badge>
    //   ),
    // },
    {
      header: tc("actions"),
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate(`/branches/edit/${info.row.original.oid}`);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedBranch(info.row.original);
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
          navigate("/branches/new");
        }}
        addLabel={t("addBranch")}
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("searchPlaceholder")}
        />
        <div className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{data.length}</span>{" "}
          branches
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
        title={t("deleteBranch")}
        message={t("deleteConfirm")}
        isLoading={isActionLoading}
      />

      <Modal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        title={t("viewLogo", { defaultValue: "Branch Logo" })}
        size="md"
      >
        <div className="space-y-6">
          <div className="aspect-square w-full relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center">
            {selectedBranch?.logoImage ? (
              <img
                src={API_BASE_URL + selectedBranch.logoImage}
                alt="Logo Preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center gap-2">
                <ImageIcon size={48} />
                <p>No Logo Found</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-4 pt-4 border-t border-gray-100">
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogoDelete}
              isLoading={isActionLoading}
              className="px-6"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {tc("delete")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsLogoModalOpen(false)}
              className="px-6"
            >
              {tc("close")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
