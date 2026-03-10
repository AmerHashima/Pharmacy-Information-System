import { forwardRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SelectOption } from "./types";

interface SelectTriggerProps {
  selectedOption: SelectOption | undefined;
  isOpen: boolean;
  disabled?: boolean;
  error?: boolean;
  /** Extra data-* attributes forwarded from the outer Select (e.g. data-row). */
  dataAttrs: Record<string, unknown>;
  onToggle: () => void;
  onClear: (e: React.MouseEvent) => void;
}

/**
 * The visible "button" that displays the current selected value
 * and toggles the dropdown open/closed.
 */
export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    { selectedOption, isOpen, disabled, error, dataAttrs, onToggle, onClear },
    ref,
  ) => {
    const { t } = useTranslation("common");

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        {...dataAttrs}
        onKeyDown={(e) => {
          // Let arrow keys bubble up for external grid-navigation without
          // interfering with dropdown keyboard behaviour when it's closed.
          if (
            !isOpen &&
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
          )
            return;
        }}
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
      >
        {/* Label */}
        <span
          className={
            selectedOption ? "text-gray-900 truncate" : "text-gray-400"
          }
        >
          {selectedOption ? selectedOption.label : t("select")}
        </span>

        {/* Clear + chevron */}
        <span className="flex items-center gap-1 shrink-0">
          {selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={onClear}
              aria-label="Clear selection"
              className="text-gray-400 hover:text-gray-600 rounded p-0.5 hover:bg-gray-100 transition-colors"
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
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";
