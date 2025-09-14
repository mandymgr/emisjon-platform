import { useEffect, useState } from "react";

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Custom hook to track element size using ResizeObserver
 * @param element - The HTML element to observe
 * @returns The current size of the element or undefined if element is null
 */
export function useSize(element: HTMLElement | null): ElementSize | undefined {
  const [size, setSize] = useState<ElementSize | undefined>(undefined);

  useEffect(() => {
    if (!element) {
      setSize(undefined);
      return;
    }

    // Set initial size
    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight
    });

    // Check if ResizeObserver is supported
    if (typeof ResizeObserver === 'undefined') {
      // Fallback to window resize for older browsers
      const handleResize = () => {
        setSize({
          width: element.offsetWidth,
          height: element.offsetHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    // Use ResizeObserver for modern browsers
    const observer = new ResizeObserver(entries => {
      if (!entries.length || !element) return;

      const entry = entries[0];
      let width: number, height: number;

      if ('borderBoxSize' in entry) {
        const boxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;
        width = boxSize.inlineSize;
        height = boxSize.blockSize;
      } else {
        // Fallback for older ResizeObserver implementations
        width = element.offsetWidth;
        height = element.offsetHeight;
      }

      setSize({ width, height });
    });

    observer.observe(element, { box: 'border-box' });

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return size;
}

/**
 * Custom hook to get element size with a ref callback
 * @returns [size, ref] - The size state and ref to attach to element
 */
export function useSizeRef<T extends HTMLElement>(): [
  ElementSize | undefined,
  (element: T | null) => void
] {
  const [element, setElement] = useState<T | null>(null);
  const size = useSize(element);

  return [size, setElement];
}