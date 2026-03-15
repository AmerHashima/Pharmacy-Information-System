import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { RoleDto } from "@/types";

interface RoleFormProps {
  initialData?: RoleDto | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function RoleForm({
  initialData,
  onSubmit,
  isLoading = false,
}: RoleFormProps) {
  const { t } = useTranslation("roles");
  const tc = useTranslation("common").t;

  const roleSchema = z.object({
    name: z.string().min(1, t("roleNameRequired")).max(50),
    description: z.string().optional(),
  });

  type RoleFormValues = z.infer<typeof roleSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || initialData.roleName || "",
        description: initialData.description || initialData.roleNameAr || "",
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          {...register("name")}
          label={t("roleName") + " (English)*"}
          placeholder="e.g. Administrator"
          error={errors.name?.message}
          disabled={isLoading}
        />
        <Input
          {...register("description")}
          label={t("description")}
          placeholder="e.g. System Administrator with full access"
          error={errors.description?.message}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-10"
        >
          {initialData ? t("updateRole") : t("createRole")}
        </Button>
      </div>
    </form>
  );
}
