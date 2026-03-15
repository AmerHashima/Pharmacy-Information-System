import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { SystemUserDto, RoleDto } from "@/types";
import { roleService } from "@/api/roleService";
import { useLookup } from "@/context/LookupContext";

interface UserFormProps {
  initialData?: SystemUserDto | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function UserForm({
  initialData,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const { t } = useTranslation("users");
  const tc = useTranslation("common").t;

  const userSchema = z.object({
    username: z.string().min(3, t("usernameMin")).max(50),
    firstName: z
      .string()
      .min(1, t("firstNameRequired", "First name is required"))
      .max(100),
    middleName: z.string().max(100).optional().or(z.literal("")),
    lastName: z
      .string()
      .min(1, t("lastNameRequired", "Last name is required"))
      .max(100),
    email: z.string().email().optional().or(z.literal("")),
    mobile: z.string().optional().or(z.literal("")),
    password: z.string().min(6, t("passwordMin")).optional().or(z.literal("")),
    roleId: z.string().min(1, t("roleRequired")),
    genderLookupId: z.string().optional().or(z.literal("")),
    birthDate: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    twoFactorEnabled: z.boolean().default(false),
  });

  type UserFormValues = z.infer<typeof userSchema>;

  const [roles, setRoles] = useState<RoleDto[]>([]);
  const { getLookupDetails } = useLookup();
  const genders = getLookupDetails("GENDER") || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      isActive: true,
      twoFactorEnabled: false,
    },
  });

  useEffect(() => {
    roleService
      .getAll()
      .then((r) => {
        setRoles(r.data.data || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        username: initialData.username || "",
        firstName: initialData.firstName || "",
        middleName: initialData.middleName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        roleId: initialData.roleId?.toString() || "",
        genderLookupId: initialData.genderLookupId || "",
        birthDate: initialData.birthDate?.split("T")[0] || "",
        isActive: initialData.isActive ?? initialData.status === 1,
        twoFactorEnabled: false,
        password: "", // Don't populate password
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register("username")}
          label="Username*"
          placeholder="e.g. jdoe"
          error={errors.username?.message}
          disabled={isLoading || !!initialData}
        />
        <Input
          {...register("firstName")}
          label={t("firstName", "First Name") + "*"}
          placeholder="e.g. John"
          error={errors.firstName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("middleName")}
          label={t("middleName", "Middle Name")}
          placeholder="e.g. D."
          error={errors.middleName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("lastName")}
          label={t("lastName", "Last Name") + "*"}
          placeholder="e.g. Doe"
          error={errors.lastName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("email")}
          label={t("email")}
          type="email"
          placeholder="e.g. john@example.com"
          error={errors.email?.message}
          disabled={isLoading}
        />
        <Input
          {...register("mobile")}
          label={t("mobile", "Mobile")}
          placeholder="e.g. +1234567890"
          error={errors.mobile?.message}
          disabled={isLoading}
        />
        <Input
          {...register("password")}
          label={initialData ? t("newPassword") : t("password") + "*"}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={isLoading}
        />
        <Select
          {...register("roleId")}
          label={t("role") + "*"}
          options={roles.map((r) => ({
            value: r.oid,
            label: r.name || r.roleName || "",
          }))}
          error={errors.roleId?.message}
          disabled={isLoading}
        />
        <Select
          {...register("genderLookupId")}
          label={t("gender", "Gender")}
          options={[
            { value: "", label: t("selectGender", "Select Gender") },
            ...genders.map((g) => ({
              value: g.oid,
              label: g.valueNameEn || "",
            })),
          ]}
          error={errors.genderLookupId?.message}
          disabled={isLoading}
        />
        <Input
          {...register("birthDate")}
          label={t("birthDate", "Birth Date")}
          type="date"
          error={errors.birthDate?.message}
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-6 items-center pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("isActive")}
            disabled={isLoading}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {tc("active")}
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("twoFactorEnabled")}
            disabled={isLoading}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {t("twoFactorAuth", "Two-Factor Auth")}
          </span>
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-10 shadow-lg shadow-blue-100"
        >
          {initialData ? t("updateUser") : t("createUser")}
        </Button>
      </div>
    </form>
  );
}
