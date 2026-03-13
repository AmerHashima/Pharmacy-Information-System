/**
 * Centralised TanStack Query key factory.
 *
 * Rules:
 *  - Keys are arrays so React Query can do partial matching for invalidation.
 *  - Each key starts with a domain string so you can wipe a whole domain with
 *    queryClient.invalidateQueries({ queryKey: queryKeys.products.all }).
 */

export const queryKeys = {
  products: {
    /** Matches every product cache entry */
    all: ["products"] as const,
    /** Paginated + optionally filtered list */
    list: (search: string) => ["products", "list", search] as const,
    /** Paginated with full filters (page, search, category, etc) */
    paginated: (page: number, search: string, dosageFormId?: string) =>
      ["products", "paginated", page, search, dosageFormId] as const,
  },

  branches: {
    all: ["branches"] as const,
    /** Full unpaginated list (for simple dropdowns) */
    allList: () => ["branches", "all"] as const,
    /** Paginated + optionally filtered list */
    list: (search: string) => ["branches", "list", search] as const,
  },

  stakeholders: {
    all: ["stakeholders"] as const,
    vendors: () => ["stakeholders", "vendors"] as const,
  },

  users: {
    all: ["users"] as const,
    list: (page: number, search: string) =>
      ["users", "list", page, search] as const,
  },
};
