import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ── Arabic translations ────────────────────────────────────────────────────
import arCommon from "./ar/common.json";
import arSidebar from "./ar/sidebar.json";
import arLogin from "./ar/login.json";
import arDashboard from "./ar/dashboard.json";
import arBranches from "./ar/branches.json";
import arProducts from "./ar/products.json";
import arUsers from "./ar/users.json";
import arSales from "./ar/sales.json";
import arStock from "./ar/stock.json";
import arRoles from "./ar/roles.json";
import arStakeholders from "./ar/stakeholders.json";
import arLookups from "./ar/lookups.json";
import arIntegrations from "./ar/integrations.json";
import arRsd from "./ar/rsd.json";

// ── English translations ───────────────────────────────────────────────────
import enCommon from "./en/common.json";
import enSidebar from "./en/sidebar.json";
import enLogin from "./en/login.json";
import enDashboard from "./en/dashboard.json";
import enBranches from "./en/branches.json";
import enProducts from "./en/products.json";
import enUsers from "./en/users.json";
import enSales from "./en/sales.json";
import enStock from "./en/stock.json";
import enRoles from "./en/roles.json";
import enStakeholders from "./en/stakeholders.json";
import enLookups from "./en/lookups.json";
import enIntegrations from "./en/integrations.json";
import enRsd from "./en/rsd.json";

export const LANGUAGES = [
  { code: "ar", label: "العربية", dir: "rtl" as const },
  { code: "en", label: "English", dir: "ltr" as const },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        common: arCommon,
        sidebar: arSidebar,
        login: arLogin,
        dashboard: arDashboard,
        branches: arBranches,
        products: arProducts,
        users: arUsers,
        sales: arSales,
        stock: arStock,
        roles: arRoles,
        stakeholders: arStakeholders,
        lookups: arLookups,
        integrations: arIntegrations,
        rsd: arRsd,
      },
      en: {
        common: enCommon,
        sidebar: enSidebar,
        login: enLogin,
        dashboard: enDashboard,
        branches: enBranches,
        products: enProducts,
        users: enUsers,
        sales: enSales,
        stock: enStock,
        roles: enRoles,
        stakeholders: enStakeholders,
        lookups: enLookups,
        integrations: enIntegrations,
        rsd: enRsd,
      },
    },
    lng: undefined, // let detector decide first
    fallbackLng: "ar", // Arabic is the default / fallback
    defaultNS: "common",
    ns: [
      "common",
      "sidebar",
      "login",
      "dashboard",
      "branches",
      "products",
      "users",
      "sales",
      "stock",
      "roles",
      "stakeholders",
      "lookups",
      "integrations",
      "rsd",
    ],

    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "pharmacy-lang",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

// Helper: get current direction
export const getDir = () => (i18n.language === "ar" ? "rtl" : "ltr");

export default i18n;
