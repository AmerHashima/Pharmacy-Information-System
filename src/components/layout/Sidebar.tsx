import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  MapPin,
  Package,
  ShoppingCart,
  Database,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Menu,
  Plug,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

const menuIcons: Record<string, any> = {
  "/": LayoutDashboard,
  "/branches": MapPin,
  "/products": Package,
  "/sales": ShoppingCart,
  "/stock": Database,
  "/stakeholders": UserCircle,
  "/users": Users,
  "/roles": ShieldCheck,
  "/lookups": Settings,
  "/integrations": Plug,
  "/rsd": ShieldCheck,
};

// paths → translation keys (sidebar namespace)
const menuKeys: {
  labelKey: string;
  icon: string;
  path: string;
  children?: { labelKey: string; path: string }[];
}[] = [
  { labelKey: "dashboard", icon: "/", path: "/" },
  { labelKey: "branches", icon: "/branches", path: "/branches" },
  { labelKey: "products", icon: "/products", path: "/products" },
  { labelKey: "sales", icon: "/sales", path: "/sales" },
  { labelKey: "stock", icon: "/stock", path: "/stock" },
  { labelKey: "stakeholders", icon: "/stakeholders", path: "/stakeholders" },
  { labelKey: "systemUsers", icon: "/users", path: "/users" },
  { labelKey: "roles", icon: "/roles", path: "/roles" },
  { labelKey: "lookups", icon: "/lookups", path: "/lookups" },
  { labelKey: "rsd", icon: "/rsd", path: "/rsd" },
  {
    labelKey: "integrations",
    icon: "/integrations",
    path: "/integrations",
    children: [
      { labelKey: "providers", path: "/integrations/providers" },
      { labelKey: "branchSettings", path: "/integrations/settings" },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
}: SidebarProps) {
  const location = useLocation();
  const { t, i18n } = useTranslation("sidebar");
  const dir = i18n.dir();
  const isRtl = dir === "rtl";
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed top-0 ${isRtl ? "right-0" : "left-0"} h-full bg-[#111827] border-gray-100 z-40 transition-all duration-300 flex flex-col shadow-xl shadow-gray-100/50
      ${isCollapsed ? "w-20" : "w-64"}
      ${isMobileOpen ? "translate-x-0" : isRtl ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"}
      ${isRtl ? "border-l" : "border-r"}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 ">
        {!isCollapsed && (
          <h1 className="text-xl font-black tracking-tight text-[#2563eb]">
            {t("pharmacyIS")}
          </h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-2 text-gray-200 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            isRtl ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )
          ) : isRtl ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuKeys.map((item) => {
          const Icon = menuIcons[item.icon] || Settings;
          const active = isActive(item.path);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenu === item.path;

          if (hasChildren) {
            return (
              <div key={item.path}>
                <button
                  onClick={() => setExpandedMenu(isExpanded ? null : item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 ${active ? "text-blue-600" : "text-gray-200 group-hover:text-gray-600"}`}
                  />
                  {!isCollapsed && (
                    <>
                      <span
                        className={`flex-1 text-start ${active ? "text-blue-600" : "text-gray-200 group-hover:text-gray-600"}`}
                      >
                        {t(item.labelKey)}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>
                {!isCollapsed && isExpanded && (
                  <div className={`${isRtl ? "pr-8" : "pl-8"} mt-1 space-y-1`}>
                    {item.children!.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                          location.pathname === child.path
                            ? "bg-blue-100 text-blue-700 font-semibold"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {t(child.labelKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${active ? "text-blue-600" : "text-gray-200 group-hover:text-gray-600"}`}
              />
              {!isCollapsed && (
                <span
                  className={`${active ? "text-blue-600" : "text-gray-200 group-hover:text-gray-600"}`}
                >
                  {t(item.labelKey)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
