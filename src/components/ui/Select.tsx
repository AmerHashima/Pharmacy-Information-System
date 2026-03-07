import {
  SelectHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
} from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      label,
      error,
      options,
      // placeholder = "Select...",
      disabled,
      required,
      searchPlaceholder = "Search...",
      // Destructure RHF register() props explicitly
      name,
      onChange,
      onBlur,
      value: valueProp,
      defaultValue,
      onSearchChange,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation("common");
    // ─── Internal UI state ──────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [internalValue, setInternalValue] = useState<string | number>(
      (valueProp ?? defaultValue ?? "") as string | number,
    );

    // Sync when RHF resets or patches the value externally
    useEffect(() => {
      if (valueProp !== undefined)
        setInternalValue(valueProp as string | number);
    }, [valueProp]);

    // ─── Refs ───────────────────────────────────────────────────────────────
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);

    /**
     * Merge the forwarded ref (from register()) with our internal ref.
     * RHF needs a real HTMLSelectElement ref for focus-on-error & value reading.
     */
    const mergeRef = (el: HTMLSelectElement | null) => {
      (
        hiddenSelectRef as React.MutableRefObject<HTMLSelectElement | null>
      ).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el;
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // ─── Derived ────────────────────────────────────────────────────────────
    const selectedOption = options.find(
      (o) => String(o.value) === String(internalValue),
    );
    const filtered = search.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

    // ─── Core: fire a native change event on the hidden <select> ────────────
    /**
     * react-hook-form registers on the native <select> via onChange.
     * When the user picks an option in our custom UI, we:
     *  1. Update React state so the trigger label re-renders.
     *  2. Set the hidden select's .value via the native setter (bypassing
     *     React's synthetic value lock).
     *  3. Dispatch a native "change" event — this bubbles up and triggers
     *     the onChange RHF bound to the hidden element.
     */
    const fireNativeChange = (newValue: string | number) => {
      const el = hiddenSelectRef.current;
      if (!el) return;
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        "value",
      )?.set;
      nativeSetter?.call(el, String(newValue));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const selectOption = (option: Option) => {
      setInternalValue(option.value);
      fireNativeChange(option.value);
      setIsOpen(false);
      setSearch("");
      triggerRef.current?.focus();
    };

    const clearSelection = (e: React.MouseEvent) => {
      e.stopPropagation();
      setInternalValue("");
      fireNativeChange("");
      setSearch("");
    };

    // ─── Side-effects ────────────────────────────────────────────────────────
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          if (isOpen) {
            setIsOpen(false);
            setSearch("");
            // Tell RHF the field was touched/blurred
            hiddenSelectRef.current?.dispatchEvent(
              new Event("blur", { bubbles: true }),
            );
          }
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => searchRef.current?.focus(), 0);
        setHighlightedIndex(-1);
      }
    }, [isOpen]);

    useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const el = listRef.current.children[highlightedIndex] as HTMLElement;
        el?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex]);

    // ─── Keyboard ────────────────────────────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      switch (e.key) {
        case "Enter":
        case " ":
          if (!isOpen) setIsOpen(true);
          else if (highlightedIndex >= 0 && filtered[highlightedIndex])
            selectOption(filtered[highlightedIndex]);
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

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
      <div
        className={`w-full relative ${className}`}
        ref={containerRef}
        onKeyDown={handleKeyDown}
      >
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {/*
          ┌─────────────────────────────────────────────────────────┐
          │  Hidden native <select>                                  │
          │  • ref → forwarded to RHF (register's ref)              │
          │  • onChange → RHF's validator / state updater           │
          │  • onBlur  → RHF's touched tracker                      │
          │  • Visually hidden via sr-only, still in the DOM        │
          └─────────────────────────────────────────────────────────┘
        */}
        <select
          ref={mergeRef}
          name={name}
          value={String(internalValue)}
          required={required}
          disabled={disabled}
          onChange={onChange} // ← RHF's onChange, called by fireNativeChange()
          onBlur={onBlur} // ← RHF's onBlur, called on outside click
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

        {/* Visible trigger */}
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={[
            "w-full flex items-center justify-between gap-2",
            "border rounded-lg px-3 py-2 text-sm bg-white text-left",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-colors duration-150",
            error ? "border-red-500" : "border-gray-300",
            isOpen ? "ring-2 ring-blue-500 border-transparent" : "",
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-50"
              : "cursor-pointer hover:border-gray-400",
          ]
            .filter(Boolean)
            .join(" ")}
          {...Object.keys(rest)
            .filter((key) => key.startsWith("data-"))
            .reduce((obj, key) => ({ ...obj, [key]: (rest as any)[key] }), {})}
          onKeyDown={(e) => {
            if (
              !isOpen &&
              ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
                e.key,
              )
            ) {
              // Don't preventDefault here, let it bubble for grid navigation
              return;
            }
          }}
        >
          <span
            className={
              selectedOption ? "text-gray-900 truncate" : "text-gray-400"
            }
          >
            {selectedOption ? selectedOption.label : t("select")}
          </span>

          <span className="flex items-center gap-1 shrink-0">
            {selectedOption && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600 rounded p-0.5 hover:bg-gray-100 transition-colors"
                aria-label="Clear selection"
              >
                <X size={13} />
              </span>
            )}
            <ChevronDown
              size={15}
              className={`text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{ maxHeight: "320px" }}
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-gray-50">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearch(val);
                    setHighlightedIndex(-1);
                    if (onSearchChange) onSearchChange(val);
                  }}
                  placeholder={searchPlaceholder}
                  className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      searchRef.current?.focus();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <ul
              ref={listRef}
              role="listbox"
              className="overflow-y-auto"
              style={{ maxHeight: "244px" }}
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-sm text-gray-400 text-center">
                  {t("no_results_found")}
                </li>
              ) : (
                filtered.map((opt, i) => {
                  const isSelected =
                    String(opt.value) === String(internalValue);
                  const isHighlighted = i === highlightedIndex;
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectOption(opt)}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      className={[
                        "px-3 py-2 text-sm cursor-pointer transition-colors duration-100",
                        isSelected
                          ? "bg-blue-600 text-white font-medium"
                          : isHighlighted
                            ? "bg-blue-50 text-gray-900"
                            : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {search.trim() ? (
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
            </ul>

            {filtered.length > 0 && (
              <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                {filtered.length} {t("of")} {options.length} {t("options")}
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

function HighlightMatch({
  text,
  query,
  isSelected,
}: {
  text: string;
  query: string;
  isSelected: boolean;
}) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        className={`font-semibold bg-transparent ${
          isSelected ? "text-white" : "text-blue-600"
        }`}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

Select.displayName = "Select";
export default Select;

// import { SelectHTMLAttributes, forwardRef } from "react";

// interface Option {
//   value: string | number;
//   label: string;
// }

// interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
//   label?: string;
//   error?: string;
//   options: Option[];
// }

// const Select = forwardRef<HTMLSelectElement, SelectProps>(
//   ({ className = "", label, error, options, ...props }, ref) => {
//     return (
//       <div className="w-full">
//         {label && (
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             {label}
//           </label>
//         )}
//         <select
//           ref={ref}
//           className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
//             error ? "border-red-500" : "border-gray-300"
//           } ${className}`}
//           {...props}
//         >
//           <option value="">Select...</option>
//           {options.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//         {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
//       </div>
//     );
//   },
// );

// Select.displayName = "Select";
// export default Select;
