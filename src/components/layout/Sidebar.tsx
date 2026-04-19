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
  Plug,
  Briefcase,
  Activity,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/config/permissions";

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
  "/management": Briefcase,
  "/operations": Activity,
  "/invoice-builder": FileText,
};

// paths → translation keys (sidebar namespace)
interface MenuItem {
  labelKey: string;
  icon?: string;
  path: string;
  permission?: string;
  children?: MenuItem[];
}

const menuKeys: MenuItem[] = [
  {
    labelKey: "dashboard",
    icon: "/",
    path: "/",
    permission: PERMISSIONS.DASHBOARD.VIEW,
  },
  // managment should be here
  {
    labelKey: "management",
    icon: "/management",
    path: "/management",
    children: [
      {
        labelKey: "products",
        path: "/products",
        permission: PERMISSIONS.PRODUCTS.VIEW,
      },
      {
        labelKey: "branches",
        path: "/branches",
        permission: PERMISSIONS.BRANCHES.VIEW,
      },
      {
        labelKey: "stores",
        path: "/stores",
        permission: PERMISSIONS.STORES.VIEW,
      },
      {
        labelKey: "systemUsers",
        path: "/users",
        permission: PERMISSIONS.USERS.VIEW,
      },
      {
        labelKey: "roles",
        path: "/roles",
        permission: PERMISSIONS.ROLES.VIEW,
      },
      {
        labelKey: "stakeholders",
        path: "/stakeholders",
        permission: PERMISSIONS.STAKEHOLDERS.VIEW,
      },
      {
        labelKey: "invoiceTemplates",
        path: "/invoice-builder",
        permission: PERMISSIONS.INVOICES.VIEW,
      },
      {
        labelKey: "lookups",
        path: "/lookups",
        permission: PERMISSIONS.LOOKUPS.VIEW,
      },
    ],
  },
  {
    labelKey: "operations",
    icon: "/operations",
    path: "/operations",
    children: [
      {
        labelKey: "sales",
        icon: "/sales",
        path: "/sales",
        permission: PERMISSIONS.SALES.VIEW,
        children: [
          {
            labelKey: "salesForm",
            icon: "/sales",
            path: "/sales",
            permission: PERMISSIONS.SALES.CREATE,
          },
          {
            labelKey: "salesHistory",
            icon: "/sales",
            path: "/sales/history",
            permission: PERMISSIONS.SALES.HISTORY,
          },
          {
            labelKey: "refundHistory",
            icon: "/sales",
            path: "/sales/refunds",
            permission: PERMISSIONS.SALES.REFUND,
          },
        ],
      },
      {
        labelKey: "stock",
        icon: "/stock",
        path: "/stock",
        permission: PERMISSIONS.STOCK.VIEW,
        children: [
          {
            labelKey: "newTransaction",
            icon: "/stock",
            path: "/stock",
            permission: PERMISSIONS.STOCK.CREATE,
          },
          {
            labelKey: "transactionHistory",
            icon: "/stock",
            path: "/stock/history",
            permission: PERMISSIONS.STOCK.HISTORY,
          },
          {
            labelKey: "stockLevels",
            icon: "/stock",
            path: "/stock/levels",
            permission: PERMISSIONS.STOCK.LEVELS,
          },
          {
            labelKey: "stockReturns",
            icon: "/stock",
            path: "/stock/returns",
            permission: PERMISSIONS.STOCK.RETURNS,
          },
        ],
      },
    ],
  },
  {
    labelKey: "rsd",
    icon: "/rsd",
    path: "/rsd",
    permission: PERMISSIONS.RSD.VIEW,
    children: [
      {
        labelKey: "rsdOperations",
        icon: "/rsd",
        path: "/rsd",
        permission: PERMISSIONS.RSD.OPERATE,
      },
      {
        labelKey: "rsdLogs",
        icon: "/rsd",
        path: "/rsd/logs",
        permission: PERMISSIONS.RSD.LOGS,
      },
    ],
  },
  {
    labelKey: "integrations",
    icon: "/integrations",
    path: "/integrations",
    permission: PERMISSIONS.INTEGRATIONS.VIEW,
    children: [
      {
        labelKey: "providers",
        path: "/integrations/providers",
        permission: PERMISSIONS.INTEGRATIONS.MANAGE,
      },
      {
        labelKey: "branchSettings",
        path: "/integrations/settings",
        permission: PERMISSIONS.INTEGRATIONS.MANAGE,
      },
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
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const { hasPermission } = usePermissions();

  const togglePath = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Auto-expand parent dropdowns when a child route is active
  useEffect(() => {
    const findActivePaths = (
      items: MenuItem[],
      targetPath: string,
      currentStack: string[],
    ): string[] | null => {
      for (const item of items) {
        if (
          item.path === targetPath ||
          (item.path !== "/" && targetPath.startsWith(item.path))
        ) {
          // If it has children, also check them for a more specific match
          if (item.children) {
            const childResult = findActivePaths(item.children, targetPath, [
              ...currentStack,
              item.path,
            ]);
            if (childResult) return childResult;
          }
          return [...currentStack, item.path];
        }
        if (item.children) {
          const childResult = findActivePaths(item.children, targetPath, [
            ...currentStack,
            item.path,
          ]);
          if (childResult) return childResult;
        }
      }
      return null;
    };

    const activePaths = findActivePaths(menuKeys, location.pathname, []);
    if (activePaths) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        activePaths.forEach((path) => next.add(path));
        return next;
      });
    }
  }, [location.pathname]);

  const isActive = (item: MenuItem): boolean => {
    if (item.path === "/") return location.pathname === "/";
    if (location.pathname.startsWith(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child));
    }
    return false;
  };

  const isChildActive = (childPath: string) => {
    return location.pathname === childPath;
  };

  const renderMenuItems = (items: MenuItem[], depth = 0) => {
    return items
      .filter((item) => !item.permission || hasPermission(item.permission))
      .map((item) => {
        const Icon = (item.icon && menuIcons[item.icon]) || Settings;
        const active = isActive(item);
        const childActive = isChildActive(item.path);
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedPaths.has(item.path);

        const visibleChildren = hasChildren
          ? item.children!.filter(
              (child) => !child.permission || hasPermission(child.permission),
            )
          : [];

        const itemStyles = childActive
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : active
            ? "bg-blue-500/10 text-blue-400"
            : "text-gray-400 hover:text-gray-100 hover:bg-white/5";

        const iconStyles = childActive
          ? "text-white"
          : active
            ? "text-blue-400"
            : "text-gray-400 group-hover:text-gray-200";

        if (hasChildren && visibleChildren.length > 0) {
          return (
            <div key={item.path} className="space-y-1">
              <button
                onClick={() => togglePath(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${itemStyles}`}
              >
                {depth === 0 && (
                  <Icon className={`h-5 w-5 flex-shrink-0 ${iconStyles}`} />
                )}
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-start">
                      {t(item.labelKey)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </>
                )}
              </button>
              {!isCollapsed && isExpanded && (
                <div
                  className={`relative ${isRtl ? "mr-6 pr-2 border-r" : "ml-6 pl-2 border-l"} border-gray-800/50 mt-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-300`}
                >
                  {renderMenuItems(visibleChildren, depth + 1)}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${itemStyles}`}
          >
            {depth === 0 && (
              <Icon className={`h-5 w-5 flex-shrink-0 ${iconStyles}`} />
            )}
            {!isCollapsed && <span className="flex-1">{t(item.labelKey)}</span>}
          </Link>
        );
      });
  };

  return (
    <aside
      className={`fixed top-0 ${isRtl ? "right-0" : "left-0"} h-full bg-[#111827] border-gray-800 z-40 transition-all duration-300 flex flex-col shadow-2xl
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
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {renderMenuItems(menuKeys)}
      </nav>
    </aside>
  );
}
