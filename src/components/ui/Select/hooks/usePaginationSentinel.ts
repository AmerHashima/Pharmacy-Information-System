import { useEffect, RefObject } from "react";

interface UsePaginationSentinelOptions {
  /** Ref to the invisible <li> sentinel at the bottom of the list. */
  sentinelRef: RefObject<HTMLLIElement>;
  /** Ref to the scrollable list container (<ul>). */
  listRef: RefObject<HTMLUListElement>;
  onLoadMore: (() => void) | undefined;
  hasMore: boolean | undefined;
  isLoadingMore: boolean;
  /** Re-observe whenever the dropdown opens/closes. */
  isOpen: boolean;
}

/**
 * Sets up an IntersectionObserver on an invisible sentinel element placed at
 * the bottom of the options list.  When the sentinel scrolls into view and
 * there are more pages available, `onLoadMore` is called.
 *
 * The observer is disconnected and recreated whenever `onLoadMore`, `hasMore`,
 * `isLoadingMore`, or `isOpen` change, ensuring stale closures are never used.
 */
export function usePaginationSentinel({
  sentinelRef,
  listRef,
  onLoadMore,
  hasMore,
  isLoadingMore,
  isOpen,
}: UsePaginationSentinelOptions) {
  useEffect(() => {
    if (!onLoadMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      {
        root: listRef.current, // relative to the scrollable <ul>
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoadingMore, isOpen, sentinelRef, listRef]);
}
