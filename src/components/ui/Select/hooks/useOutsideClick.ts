import { useEffect, RefObject } from "react";

/**
 * Closes the dropdown when the user clicks outside the container element.
 * Also dispatches a native "blur" event on the hidden <select> so that
 * react-hook-form marks the field as touched.
 */
export function useOutsideClick(
  containerRef: RefObject<HTMLElement>,
  hiddenSelectRef: RefObject<HTMLSelectElement>,
  isOpen: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !isOpen ||
        !containerRef.current ||
        containerRef.current.contains(e.target as Node)
      )
        return;

      onClose();
      hiddenSelectRef.current?.dispatchEvent(
        new Event("blur", { bubbles: true }),
      );
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, containerRef, hiddenSelectRef, onClose]);
}
