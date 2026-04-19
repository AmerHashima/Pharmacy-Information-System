// ─── Permission Constants ────────────────────────────────────────────────────
// All available permissions grouped by module.
// These are used across the app for access control via usePermissions hook
// and PermissionGate component.

export const PERMISSIONS = {
  DASHBOARD: {
    VIEW: "dashboard.view",
  },
  BRANCHES: {
    VIEW: "branches.view",
    CREATE: "branches.create",
    EDIT: "branches.edit",
    DELETE: "branches.delete",
  },
  STORES: {
    VIEW: "stores.view",
    CREATE: "stores.create",
    EDIT: "stores.edit",
    DELETE: "stores.delete",
  },
  PRODUCTS: {
    VIEW: "products.view",
    CREATE: "products.create",
    EDIT: "products.edit",
    DELETE: "products.delete",
  },
  SALES: {
    VIEW: "sales.view",
    CREATE: "sales.create",
    HISTORY: "sales.history",
    REFUND: "sales.refund",
  },
  STOCK: {
    VIEW: "stock.view",
    CREATE: "stock.create",
    HISTORY: "stock.history",
    LEVELS: "stock.levels",
    RETURNS: "stock.returns",
  },
  STAKEHOLDERS: {
    VIEW: "stakeholders.view",
    CREATE: "stakeholders.create",
    EDIT: "stakeholders.edit",
    DELETE: "stakeholders.delete",
  },
  USERS: {
    VIEW: "users.view",
    CREATE: "users.create",
    EDIT: "users.edit",
    DELETE: "users.delete",
  },
  ROLES: {
    VIEW: "roles.view",
    CREATE: "roles.create",
    EDIT: "roles.edit",
    DELETE: "roles.delete",
  },
  LOOKUPS: {
    VIEW: "lookups.view",
    MANAGE: "lookups.manage",
  },
  INTEGRATIONS: {
    VIEW: "integrations.view",
    MANAGE: "integrations.manage",
  },
  RSD: {
    VIEW: "rsd.view",
    OPERATE: "rsd.operate",
    LOGS: "rsd.logs",
  },
  INVOICES: {
    VIEW: "invoices.view",
    MANAGE: "invoices.manage",
  },
} as const;

// ─── Type Helpers ────────────────────────────────────────────────────────────

/** Extract all permission string values from PERMISSIONS */
type PermissionValues<T> = T extends string
  ? T
  : { [K in keyof T]: PermissionValues<T[K]> }[keyof T];

export type Permission = PermissionValues<typeof PERMISSIONS>;

/** Flatten all permission strings into an array (useful for "grant all") */
function collectPermissions(obj: Record<string, unknown>): string[] {
  const perms: string[] = [];
  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      perms.push(value);
    } else if (typeof value === "object" && value !== null) {
      perms.push(...collectPermissions(value as Record<string, unknown>));
    }
  }
  return perms;
}

export const ALL_PERMISSIONS: string[] = collectPermissions(PERMISSIONS);
