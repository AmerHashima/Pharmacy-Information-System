import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import BranchForm from "./BranchForm";
import BranchInvoiceSetupTab from "./components/BranchInvoiceSetupTab";
import { branchService } from "@/api/branchService";
import { handleApiError } from "@/utils/handleApiError";
import { BranchDto } from "@/types";

export default function BranchFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("branches");
  const [initialData, setInitialData] = useState<BranchDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchBranch = async () => {
        setIsLoading(true);
        try {
          const res = await branchService.getById(id);
          if (res.data.success && res.data.data) {
            setInitialData(res.data.data);
          }
        } catch (err) {
          handleApiError(err);
          navigate("/branches");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBranch();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData: any) => {
    setIsSaving(true);
    try {
      if (id) {
        await branchService.update(id, {
          ...formData,
          oid: id,
        });
        toast.success(t("branchUpdated"));
      } else {
        await branchService.create(formData);
        toast.success(t("branchCreated"));
      }
      navigate("/branches");
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto space-y-6">
      <PageHeader
        title={id ? t("editBranch") : t("addBranch")}
        onBack={() => navigate("/branches")}
      />

      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <BranchForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        )}
      </Card>

      {id && (
        <BranchInvoiceSetupTab
          branchId={initialData?.oid}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
