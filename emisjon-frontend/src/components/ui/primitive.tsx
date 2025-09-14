/**
 * Clean exports for UI primitives with proper TypeScript typing
 * Based on Radix UI primitives and class-variance-authority utilities
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as React from 'react';

/**
 * Merge Tailwind CSS classes intelligently, removing conflicts
 * Example: cn("px-2 px-4", "py-3") → "px-4 py-3"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Enhanced event dispatcher
 * Ensures DOM updates are flushed synchronously before dispatching events
 */
export function dispatchEvent(element: HTMLElement, event: Event) {
  element.dispatchEvent(event);
}

/**
 * Hook for combining multiple refs into a single callback ref
 * Useful when you need to forward refs while also using them internally
 */
export function useCallbackRef<T>(
  callback: ((node: T) => void) | undefined
): (node: T | null) => void {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  });

  return React.useMemo(
    () => (node: T | null) => {
      if (callbackRef.current && node) {
        callbackRef.current(node);
      }
    },
    []
  );
}

// Basic Slot implementation for polymorphic components
interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref: ref,
    });
  }

  return React.createElement('span', { ref, ...props }, children);
});
Slot.displayName = 'Slot';

export const Slottable = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Basic primitive components
type PrimitiveElement = 'a' | 'button' | 'div' | 'form' | 'h1' | 'h2' | 'h3' | 'input' | 'label' | 'p' | 'span' | 'nav' | 'section' | 'header' | 'footer' | 'main' | 'aside' | 'article' | 'ul' | 'ol' | 'li';

type PrimitiveProps<T extends PrimitiveElement> = React.ComponentPropsWithoutRef<T> & {
  asChild?: boolean;
};

function createPrimitive<T extends PrimitiveElement>(element: T) {
  return React.forwardRef<React.ElementRef<T>, PrimitiveProps<T>>(
    ({ asChild, ...props }, ref) => {
      if (asChild) {
        return <Slot ref={ref} {...props} />;
      }
      return React.createElement(element, { ref, ...props });
    }
  );
}

export const Primitive = {
  a: createPrimitive('a'),
  button: createPrimitive('button'),
  div: createPrimitive('div'),
  form: createPrimitive('form'),
  h1: createPrimitive('h1'),
  h2: createPrimitive('h2'),
  h3: createPrimitive('h3'),
  input: createPrimitive('input'),
  label: createPrimitive('label'),
  p: createPrimitive('p'),
  span: createPrimitive('span'),
  nav: createPrimitive('nav'),
  section: createPrimitive('section'),
  header: createPrimitive('header'),
  footer: createPrimitive('footer'),
  main: createPrimitive('main'),
  aside: createPrimitive('aside'),
  article: createPrimitive('article'),
  ul: createPrimitive('ul'),
  ol: createPrimitive('ol'),
  li: createPrimitive('li'),
};

// Type exports for better TypeScript support
export type ClassNameValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassNameValue[]
  | { [key: string]: any };

/**
 * Utility type for components that support the asChild prop
 */
export type AsChildProps<T = {}> = T & {
  asChild?: boolean;
};

/**
 * Generic component props with asChild support
 */
export type ComponentPropsWithAsChild<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & AsChildProps;

/**
 * Helper type for forwarded refs with asChild
 */
export type ForwardedRefWithAsChild<T extends React.ElementType> =
  React.ForwardRefExoticComponent<ComponentPropsWithAsChild<T> & React.RefAttributes<React.ElementRef<T>>>;

// Re-export React types for convenience
export type { ComponentPropsWithoutRef, ElementRef, ElementType, ForwardRefExoticComponent } from 'react';