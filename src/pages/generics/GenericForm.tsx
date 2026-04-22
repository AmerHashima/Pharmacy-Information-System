import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useTranslation } from "react-i18next";
import { GenericNameDto } from "@/types";

const genericSchema = z.object({
  nameEN: z.string().min(1, "English name is required").max(200),
  nameAR: z.string().min(1, "Arabic name is required").max(200),
});

type GenericFormValues = z.infer<typeof genericSchema>;

interface GenericFormProps {
  initialData?: GenericNameDto | null;
  onSubmit: (data: GenericFormValues) => void;
  isLoading?: boolean;
}

export default function GenericForm({
  initialData,
  onSubmit,
  isLoading = false,
}: GenericFormProps) {
  const { t } = useTranslation("generics");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GenericFormValues>({
    resolver: zodResolver(genericSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nameEN: initialData.nameEN || "",
        nameAR: initialData.nameAR || "",
      });
    } else {
      reset({
        nameEN: "",
        nameAR: "",
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register("nameEN")}
          label={t("nameEN") + "*"}
          placeholder="e.g. Paracetamol"
          error={errors.nameEN?.message}
          disabled={isLoading}
        />
        <Input
          {...register("nameAR")}
          label={t("nameAR") + "*"}
          placeholder="e.g. باراسيتامول"
          error={errors.nameAR?.message}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-10"
        >
          {initialData ? t("updateGeneric") : t("createGeneric")}
        </Button>
      </div>
    </form>
  );
}
