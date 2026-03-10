import { useRef, RefObject } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SelectOption } from "./types";
import { SelectOptionsList } from "./SelectOptionsList";

interface SelectDropdownProps {
  listRef: RefObject<HTMLUListElement>;
  searchRef: RefObject<HTMLInputElement>;
  search: string;
  searchPlaceholder: string;
  filtered: SelectOption[];
  internalValue: string | number;
  highlightedIndex: number;
  isServerSearch: boolean;
  isLoadingMore: boolean;
  isSearchPending: boolean;
  isPaginated: boolean;
  hasMore: boolean | undefined;
  isOpen: boolean;
  onLoadMore: (() => void) | undefined;
  onSearchInput: (value: string) => void;
  onClearSearch: () => void;
  onSelect: (option: SelectOption) => void;
  onHighlight: (index: number) => void;
}

/**
 * The dropdown panel: sticky search bar on top + the scrollable options list
 * + a footer showing the option count.
 */
export function SelectDropdown({
  listRef,
  searchRef,
  search,
  searchPlaceholder,
  filtered,
  internalValue,
  highlightedIndex,
  isServerSearch,
  isLoadingMore,
  isSearchPending,
  isPaginated,
  hasMore,
  isOpen,
  onLoadMore,
  onSearchInput,
  onClearSearch,
  onSelect,
  onHighlight,
}: SelectDropdownProps) {
  const { t } = useTranslation("common");

  return (
    <div
      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      style={{ maxHeight: "320px" }}
    >
      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-gray-50">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => onSearchInput(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
          />
          {search && (
            <button
              type="button"
              onClick={onClearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Options ─────────────────────────────────────────────────────────── */}
      <SelectOptionsList
        listRef={listRef}
        filtered={filtered}
        internalValue={internalValue}
        highlightedIndex={highlightedIndex}
        search={search}
        isServerSearch={isServerSearch}
        isLoadingMore={isLoadingMore}
        isSearchPending={isSearchPending}
        isPaginated={isPaginated}
        hasMore={hasMore}
        isOpen={isOpen}
        onLoadMore={onLoadMore}
        onSelect={onSelect}
        onHighlight={onHighlight}
      />

      {/* ── Footer count ────────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
          {filtered.length} {t("options")}
          {isPaginated &&
            hasMore &&
            ` · ${t("scroll_for_more") ?? "scroll for more"}`}
        </div>
      )}
    </div>
  );
}
