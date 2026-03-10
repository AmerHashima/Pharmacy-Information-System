import { SelectHTMLAttributes } from "react";

// ─── Option ───────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string | number;
  label: string;
}

// ─── Pagination (discriminated union) ────────────────────────────────────────
//
// Branch A — paginated Select: onLoadMore + hasMore are BOTH required.
//   <Select onLoadMore={fn} hasMore={bool} ... />
//
// Branch B — static Select: none of the three props may appear.
//   <Select options={[...]} ... />
//
// TypeScript enforces this at every call-site via the `never` guard; callers
// that use static options compile without any change.

export type PaginationProps =
  | {
      /** Called when the user scrolls near the bottom of the list. */
      onLoadMore: () => void;
      /** Whether more pages are available from the server. */
      hasMore: boolean;
      /** Shows a spinner row while the next page is loading. */
      isLoadingMore?: boolean;
    }
  | {
      onLoadMore?: never;
      hasMore?: never;
      isLoadingMore?: never;
    };

// ─── SelectProps ──────────────────────────────────────────────────────────────
//
// We use `type` (intersection) instead of `interface extends` because
// TypeScript does not allow an interface to extend a union type.

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> &
  PaginationProps & {
    label?: string;
    error?: string;
    options: SelectOption[];
    searchPlaceholder?: string;
    /** Called on every keystroke in the search box (debounce in parent). */
    onSearchChange?: (search: string) => void;
  };
