import { useRef, RefObject } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SelectOption } from "./types";
import { HighlightMatch } from "./HighlightMatch";
import { usePaginationSentinel } from "./hooks/usePaginationSentinel";

interface SelectOptionsListProps {
  listRef: RefObject<HTMLUListElement>;
  filtered: SelectOption[];
  internalValue: string | number;
  highlightedIndex: number;
  search: string;
  isServerSearch: boolean;
  isLoadingMore: boolean;
  isSearchPending: boolean;
  isPaginated: boolean;
  hasMore: boolean | undefined;
  isOpen: boolean;
  onLoadMore: (() => void) | undefined;
  onSelect: (option: SelectOption) => void;
  onHighlight: (index: number) => void;
}

/**
 * The scrollable `<ul>` containing:
 *  - a loading spinner (when data is pending / in-flight)
 *  - the option rows
 *  - the invisible IntersectionObserver sentinel for pagination
 *  - a "load more" spinner row
 *  - an "All results loaded" hint
 */
export function SelectOptionsList({
  listRef,
  filtered,
  internalValue,
  highlightedIndex,
  search,
  isServerSearch,
  isLoadingMore,
  isSearchPending,
  isPaginated,
  hasMore,
  isOpen,
  onLoadMore,
  onSelect,
  onHighlight,
}: SelectOptionsListProps) {
  const { t } = useTranslation("common");
  const sentinelRef = useRef<HTMLLIElement>(null);

  usePaginationSentinel({
    sentinelRef,
    listRef,
    onLoadMore,
    hasMore,
    isLoadingMore,
    isOpen,
  });

  const isLoading = isLoadingMore || isSearchPending;

  return (
    <ul
      ref={listRef}
      role="listbox"
      className="overflow-y-auto"
      style={{ maxHeight: "244px" }}
    >
      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 && isLoading ? (
        <li className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span>{t("loading") ?? "Loading…"}</span>
        </li>
      ) : filtered.length === 0 ? (
        <li className="px-3 py-6 text-sm text-gray-400 text-center">
          {t("no_results_found")}
        </li>
      ) : (
        /* ── Option rows ──────────────────────────────────────────────────── */
        filtered.map((opt, i) => {
          const isSelected = String(opt.value) === String(internalValue);
          const isHighlighted = i === highlightedIndex;
          return (
            <li
              key={opt.value}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(opt)}
              onMouseEnter={() => onHighlight(i)}
              className={[
                "px-3 py-2 text-sm cursor-pointer transition-colors duration-100",
                isSelected
                  ? "bg-blue-600 text-white font-medium"
                  : isHighlighted
                    ? "bg-blue-50 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {/* Local text highlighting — only for client-side filtering */}
              {search.trim() && !isServerSearch ? (
                <HighlightMatch
                  text={opt.label}
                  query={search}
                  isSelected={isSelected}
                />
              ) : (
                opt.label
              )}
            </li>
          );
        })
      )}

      {/* ── Pagination sentinel (invisible) ─────────────────────────────────── */}
      {isPaginated && (
        <li ref={sentinelRef} aria-hidden="true" className="h-1" />
      )}

      {/* ── "Load more" spinner (while next page is in-flight) ──────────────── */}
      {isLoadingMore && (
        <li className="flex items-center justify-center gap-2 px-3 py-3 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          <span>{t("loading") ?? "Loading…"}</span>
        </li>
      )}

      {/* ── "All results loaded" hint ────────────────────────────────────────── */}
      {isPaginated && !hasMore && filtered.length > 0 && (
        <li className="px-3 py-2 text-xs text-gray-300 text-center border-t border-gray-50">
          {t("all_results_loaded") ?? "All results loaded"}
        </li>
      )}
    </ul>
  );
}
