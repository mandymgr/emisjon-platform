import { useEffect, useRef } from "react";

/**
 * Custom hook to track the previous value of a variable
 * @param value - The current value to track
 * @returns The previous value or undefined on first render
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<{ value: T; previous: T | undefined }>({
    value,
    previous: undefined
  });

  useEffect(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
  }, [value]);

  return ref.current.previous;
}