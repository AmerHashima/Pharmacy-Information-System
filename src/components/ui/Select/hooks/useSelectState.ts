import { useState, useEffect, useRef } from "react";
import { SelectOption } from "../types";

interface UseSelectStateOptions {
  valueProp: string | number | readonly string[] | undefined;
  defaultValue: string | number | readonly string[] | undefined;
  options: SelectOption[];
  hasServerSearch: boolean; // true when onSearchChange is provided
  isPaginated: boolean; // true when onLoadMore is provided
}

export interface SelectActions {
  internalValue: string | number;
  search: string;
  isOpen: boolean;
  highlightedIndex: number;
  isSearchPending: boolean;
  /** Options visible in the list (server-filtered or locally-filtered). */
  filtered: SelectOption[];
  selectedOption: SelectOption | undefined;
  setSearch: (s: string) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  /**
   * Marks search as pending immediately — call this the instant onSearchChange
   * fires so we get a spinner during the debounce window.
   */
  markSearchPending: () => void;
  /**
   * Commits a selection: updates internal state and fires the native change
   * event on `hiddenSelectEl`.
   */
  commitSelection: (
    option: SelectOption,
    hiddenSelectEl: HTMLSelectElement | null,
    triggerEl: HTMLButtonElement | null,
  ) => void;
  /**
   * Clears the current selection.
   */
  clearSelection: (
    e: React.MouseEvent,
    hiddenSelectEl: HTMLSelectElement | null,
  ) => void;
}

/**
 * Encapsulates all internal state for the custom Select:
 * - internalValue (mirrors the RHF/prop value)
 * - search string + highlighting
 * - open/closed state
 * - isSearchPending (covers debounce + API timing gaps)
 * - filtered options list
 */
export function useSelectState({
  valueProp,
  defaultValue,
  options,
  hasServerSearch,
  isPaginated,
}: UseSelectStateOptions): SelectActions {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState<string | number>(
    (valueProp ?? defaultValue ?? "") as string | number,
  );

  /**
   * Tracks whether a server-side response is still pending.
   * Starts as `true` for paginated Selects so the very first open
   * shows a spinner rather than "No results found".
   */
  const [isSearchPending, setIsSearchPending] = useState(() => isPaginated);

  // Sync internalValue when RHF resets or patches the value externally
  useEffect(() => {
    if (valueProp !== undefined) setInternalValue(valueProp as string | number);
  }, [valueProp]);

  // Any change to the options prop means the parent responded — clear pending
  useEffect(() => {
    setIsSearchPending(false);
  }, [options]);

  // ─── Derived ────────────────────────────────────────────────────────────────
  const selectedOption = options.find(
    (o) => String(o.value) === String(internalValue),
  );

  /**
   * When onSearchChange is provided the parent owns the filtering (server-side),
   * so we show options as-is.  Otherwise we do local client-side filtering.
   */
  const filtered = hasServerSearch
    ? options
    : search.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

  // ─── Actions ────────────────────────────────────────────────────────────────

  /** Fires a native "change" event on the hidden <select> so RHF picks it up. */
  const fireNativeChange = (
    newValue: string | number,
    el: HTMLSelectElement | null,
  ) => {
    if (!el) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      "value",
    )?.set;
    nativeSetter?.call(el, String(newValue));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const commitSelection = (
    option: SelectOption,
    hiddenSelectEl: HTMLSelectElement | null,
    triggerEl: HTMLButtonElement | null,
  ) => {
    setInternalValue(option.value);
    fireNativeChange(option.value, hiddenSelectEl);
    setIsOpen(false);
    setSearch("");
    triggerEl?.focus();
  };

  const clearSelection = (
    e: React.MouseEvent,
    hiddenSelectEl: HTMLSelectElement | null,
  ) => {
    e.stopPropagation();
    setInternalValue("");
    fireNativeChange("", hiddenSelectEl);
    setSearch("");
  };

  const markSearchPending = () => setIsSearchPending(true);

  return {
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
  };
}
