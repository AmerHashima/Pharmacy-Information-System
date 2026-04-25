import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pill, Lock, User, Eye, EyeOff, Globe, Mail, Phone, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormError from "@/components/ui/FormError";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register: signUp } = useAuth();
  const { t, i18n } = useTranslation("register");

  const registerSchema = z.object({
    firstName: z.string().min(1, t("firstNameRequired")),
    lastName: z.string().min(1, t("lastNameRequired")),
    username: z.string().min(3, t("usernameRequired")),
    email: z.string().email(t("emailInvalid")).optional().or(z.literal("")),
    mobile: z.string().optional(),
    password: z.string().min(6, t("passwordRequired")),
    confirmPassword: z.string().min(6, t("confirmPasswordRequired")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("passwordsMustMatch"),
    path: ["confirmPassword"],
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await signUp({
        ...data,
        email: data.email || undefined,
        confirmPassword: data.confirmPassword,
      });
    } catch (err: any) {
      setError(err.message || t("registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#E0E7FF,_transparent_50%),_radial-gradient(circle_at_bottom_left,_#F0FDF4,_transparent_50%)]">
      <div className="max-w-xl w-full">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border border-gray-200 bg-white/80 backdrop-blur-md hover:bg-white text-gray-700 transition-all shadow-sm"
          >
            <Globe className="h-4 w-4 text-blue-600" />
            <span>{i18n.language === "ar" ? "English" : "العربية"}</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 mb-6 transform hover:rotate-12 transition-transform duration-300">
            <Pill className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-500 font-medium text-lg">{t("subtitle")}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-10 border border-white relative overflow-hidden">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-50 rounded-full -ml-12 -mb-12 opacity-50" />

          <FormError message={error || undefined} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Input
                  {...register("firstName")}
                  label={t("firstName")}
                  placeholder={t("firstNamePlaceholder")}
                  error={errors.firstName?.message}
                  disabled={isLoading}
                  className="rounded-2xl border-gray-200 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <Input
                  {...register("lastName")}
                  label={t("lastName")}
                  placeholder={t("lastNamePlaceholder")}
                  error={errors.lastName?.message}
                  disabled={isLoading}
                  className="rounded-2xl border-gray-200 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Input
                  {...register("username")}
                  label={t("username")}
                  placeholder={t("usernamePlaceholder")}
                  error={errors.username?.message}
                  disabled={isLoading}
                  className="ps-10 rounded-2xl border-gray-200 focus:ring-blue-500/20"
                />
                <div className="absolute inset-y-0 start-0 top-8 ps-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
              </div>
              <div className="relative">
                <Input
                  {...register("email")}
                  label={t("email")}
                  placeholder={t("emailPlaceholder")}
                  error={errors.email?.message}
                  disabled={isLoading}
                  className="ps-10 rounded-2xl border-gray-200 focus:ring-blue-500/20"
                />
                <div className="absolute inset-y-0 start-0 top-8 ps-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="relative">
              <Input
                {...register("mobile")}
                label={t("mobile")}
                placeholder={t("mobilePlaceholder")}
                error={errors.mobile?.message}
                disabled={isLoading}
                className="ps-10 rounded-2xl border-gray-200 focus:ring-blue-500/20"
              />
              <div className="absolute inset-y-0 start-0 top-8 ps-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="h-4 w-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Input
                  {...register("password")}
                  label={t("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  error={errors.password?.message}
                  disabled={isLoading}
                  className="ps-10 rounded-2xl border-gray-200 focus:ring-blue-500/20"
                />
                <div className="absolute inset-y-0 start-0 top-8 ps-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  label={t("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("confirmPasswordPlaceholder")}
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                  className="ps-10 rounded-2xl border-gray-200 focus:ring-blue-500/20"
                />
                <div className="absolute inset-y-0 start-0 top-8 ps-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-2xl shadow-xl shadow-blue-200 text-lg font-bold mt-4 flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              <span>{t("signUp")}</span>
              {!isLoading && <ChevronRight className="h-5 w-5" />}
            </Button>

            <div className="text-center mt-6">
              <span className="text-gray-500 font-medium">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  {t("signIn")}
                </Link>
              </span>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400 font-medium">
          Powered by <span className="text-gray-600">Pharmacy Pro System</span>
        </p>
      </div>
    </div>
  );
}
