import {
  forwardRef,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import { SelectProps } from "./types";
import { useSelectState } from "./hooks/useSelectState";
import { useOutsideClick } from "./hooks/useOutsideClick";
import { SelectTrigger } from "./SelectTrigger";
import { SelectDropdown } from "./SelectDropdown";

// Re-export types that callers import from "@/components/ui/Select"
export type { SelectOption, SelectProps } from "./types";

/**
 * Custom Select component with:
 *  - react-hook-form compatibility (hidden native <select> + forwardRef)
 *  - keyboard navigation (ArrowUp/Down, Enter, Escape, Tab)
 *  - optional server-side search (onSearchChange prop)
 *  - optional infinite-scroll pagination (onLoadMore + hasMore props)
 *  - "isSearchPending" to avoid "No results found" flash during loading
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      label,
      error,
      options,
      disabled,
      required,
      searchPlaceholder = "Search...",
      name,
      onChange,
      onBlur,
      value: valueProp,
      defaultValue,
      onSearchChange,
      // Pagination
      onLoadMore,
      hasMore,
      isLoadingMore = false,
      ...rest
    },
    ref,
  ) => {
    // ─── Refs ─────────────────────────────────────────────────────────────────
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    /**
     * Merges the forwarded ref (used by react-hook-form's `register()`) with
     * our internal ref.  RHF needs a real HTMLSelectElement ref so it can
     * call `.focus()` on validation errors and read the current `.value`.
     */
    const mergeRef = useCallback(
      (el: HTMLSelectElement | null) => {
        (
          hiddenSelectRef as React.MutableRefObject<HTMLSelectElement | null>
        ).current = el;
        if (typeof ref === "function") ref(el);
        else if (ref)
          (ref as React.MutableRefObject<HTMLSelectElement | null>).current =
            el;
      },
      [ref],
    );

    // ─── State ────────────────────────────────────────────────────────────────
    const {
      internalValue,
      search,
      isOpen,
      highlightedIndex,
      isSearchPending,
      filtered,
      selectedOption,
      setSearch,
      setIsOpen,
      setHighlightedIndex,
      markSearchPending,
      commitSelection,
      clearSelection,
    } = useSelectState({
      valueProp,
      defaultValue,
      options,
      hasServerSearch: !!onSearchChange,
      isPaginated: !!onLoadMore,
    });

    // ─── Side-effects ─────────────────────────────────────────────────────────

    useOutsideClick(containerRef, hiddenSelectRef, isOpen, () => {
      setIsOpen(false);
      setSearch("");
    });

    // Auto-focus search input when the dropdown opens
    useEffect(() => {
      if (isOpen) {
        setTimeout(() => searchRef.current?.focus(), 0);
        setHighlightedIndex(-1);
      }
    }, [isOpen, setHighlightedIndex]);

    // Scroll highlighted item into view
    useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const el = listRef.current.children[highlightedIndex] as HTMLElement;
        el?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex]);

    // ─── Keyboard navigation ──────────────────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      // When the search input is focused, Space must type — not activate selection.
      // All other keys (ArrowUp/Down, Enter, Escape, Tab) still work as expected.
      if (isOpen && e.key === " " && e.target === searchRef.current) return;

      switch (e.key) {
        case "Enter":
        case " ":
          if (!isOpen) setIsOpen(true);
          else if (highlightedIndex >= 0 && filtered[highlightedIndex])
            commitSelection(
              filtered[highlightedIndex],
              hiddenSelectRef.current,
              triggerRef.current,
            );
          e.preventDefault();
          break;
        case "ArrowDown":
          if (isOpen) {
            e.preventDefault();
            setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
          }
          break;
        case "ArrowUp":
          if (isOpen) {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearch("");
          triggerRef.current?.focus();
          break;
        case "Tab":
          setIsOpen(false);
          setSearch("");
          break;
      }
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleSearchInput = (value: string) => {
      setSearch(value);
      setHighlightedIndex(-1);
      if (onSearchChange) {
        // Mark pending immediately — spinner shows before debounce even fires
        markSearchPending();
        onSearchChange(value);
      }
    };

    const handleClearSearch = () => {
      setSearch("");
      searchRef.current?.focus();
    };

    // Collect data-* attrs to forward onto the trigger button
    const dataAttrs = Object.keys(rest)
      .filter((k) => k.startsWith("data-"))
      .reduce<Record<string, unknown>>(
        (acc, k) => ({ ...acc, [k]: (rest as any)[k] }),
        {},
      );

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
      <div
        className={`w-full relative ${className}`}
        ref={containerRef}
        onKeyDown={handleKeyDown}
      >
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {/*
          Hidden native <select>:
          • ref  → forwarded to RHF (register's ref)
          • onChange → RHF's validator / state updater
          • onBlur   → RHF's touched tracker
          Visually hidden (sr-only), but real in the DOM.
        */}
        <select
          ref={mergeRef}
          name={name}
          value={String(internalValue)}
          required={required}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          {...rest}
        >
          <option value="" />
          {options.map((o) => (
            <option key={o.value} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Trigger button */}
        <SelectTrigger
          ref={triggerRef}
          selectedOption={selectedOption}
          isOpen={isOpen}
          disabled={disabled}
          error={!!error}
          dataAttrs={dataAttrs}
          onToggle={() => !disabled && setIsOpen((o) => !o)}
          onClear={(e) => clearSelection(e, hiddenSelectRef.current)}
        />

        {/* Dropdown panel */}
        {isOpen && (
          <SelectDropdown
            listRef={listRef}
            searchRef={searchRef}
            search={search}
            searchPlaceholder={searchPlaceholder}
            filtered={filtered}
            internalValue={internalValue}
            highlightedIndex={highlightedIndex}
            isServerSearch={!!onSearchChange}
            isLoadingMore={isLoadingMore}
            isSearchPending={isSearchPending}
            isPaginated={!!onLoadMore}
            hasMore={hasMore}
            isOpen={isOpen}
            onLoadMore={onLoadMore}
            onSearchInput={handleSearchInput}
            onClearSearch={handleClearSearch}
            onSelect={(opt) =>
              commitSelection(opt, hiddenSelectRef.current, triggerRef.current)
            }
            onHighlight={setHighlightedIndex}
          />
        )}

        {/* Inline error */}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
