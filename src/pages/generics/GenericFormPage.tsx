import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import GenericForm from "./GenericForm";
import { genericNameService } from "@/api/genericNameService";
import { handleApiError } from "@/utils/handleApiError";
import { GenericNameDto } from "@/types";

export default function GenericFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("generics");
  const [initialData, setInitialData] = useState<GenericNameDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchGeneric = async () => {
        setIsLoading(true);
        try {
          const res = await genericNameService.getById(id);
          if (res.data.success && res.data.data) {
            setInitialData(res.data.data);
          }
        } catch (err) {
          handleApiError(err);
          navigate("/generics");
        } finally {
          setIsLoading(false);
        }
      };
      fetchGeneric();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData: any) => {
    setIsSaving(true);
    try {
      if (id) {
        await genericNameService.update(id, {
          ...formData,
          oid: id,
        });
        toast.success(t("genericUpdated"));
      } else {
        await genericNameService.create(formData);
        toast.success(t("genericCreated"));
      }
      navigate("/generics");
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/generics")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader title={id ? t("editGeneric") : t("addGeneric")} />
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <GenericForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        )}
      </Card>
    </div>
  );
}
