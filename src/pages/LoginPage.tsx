import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pill, Lock, User, Eye, EyeOff, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormError from "@/components/ui/FormError";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { t, i18n } = useTranslation("login");

  const loginSchema = z.object({
    username: z
      .string()
      .min(1, t("usernameRequired"))
      .max(50, t("usernameTooLong")),
    password: z
      .string()
      .min(1, t("passwordRequired"))
      .max(100, t("passwordTooLong")),
    rememberMe: z.boolean().optional(),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data);
    } catch (err: any) {
      setError(err.message || t("invalidCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>{i18n.language === "ar" ? "English" : "العربية"}</span>
          </button>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Pill className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">{t("subtitle")}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <FormError message={error || undefined} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 top-5 start-0 ps-3 flex items-center pointer-events-none text-gray-400">
                <User className="h-4 w-4" />
              </div>
              <Input
                {...register("username")}
                label={t("username")}
                placeholder={t("usernamePlaceholder")}
                className="ps-10"
                error={errors.username?.message}
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 top-5 start-0 ps-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                {...register("password")}
                label={t("password")}
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                className="ps-10"
                error={errors.password?.message}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  {...register("rememberMe")}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ms-2 text-sm text-gray-600 font-medium">
                  {t("rememberMe")}
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                {t("forgotPassword")}
              </a>
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-xl shadow-lg shadow-blue-200"
              isLoading={isLoading}
            >
              {t("signIn")}
            </Button>

            <div className="text-center mt-6">
              <span className="text-sm text-gray-500 font-medium">
                {t("noAccount")}{" "}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  {t("signUp")}
                </Link>
              </span>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-500 font-medium">
          {t("poweredBy")} <span className="text-gray-900">{t("company")}</span>
        </p>
      </div>
    </div>
  );
}
