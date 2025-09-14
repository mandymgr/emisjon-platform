/**
 * Clean exports for UI primitives with proper TypeScript typing
 * Based on Radix UI primitives and class-variance-authority utilities
 */

// Import the minified exports and re-export with clean names
import {
  P as PrimitiveComponents,
  S as SlotComponent,
  b as SlottableComponent,
  c as mergeClasses,
  d as dispatchEventSync,
  u as useCallbackRef
} from "./index-BXIIbVIk"; // Adjust path as needed

/**
 * Merge Tailwind CSS classes intelligently, removing conflicts
 * Example: cn("px-2 px-4", "py-3") → "px-4 py-3"
 */
export const cn = mergeClasses;

/**
 * Radix-style Slot component for polymorphic rendering
 * Allows components to render as different elements via asChild prop
 */
export const Slot = SlotComponent;

/**
 * Slottable wrapper component for conditional slot behavior
 */
export const Slottable = SlottableComponent;

/**
 * Collection of primitive HTML elements with forwardRef and asChild support
 * Usage: <Primitive.button asChild><Link href="/">Button</Link></Primitive.button>
 */
export const Primitive = PrimitiveComponents as {
  a: React.ForwardRefExoticComponent<
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean } & React.RefAttributes<HTMLAnchorElement>
  >;
  button: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>
  >;
  div: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean } & React.RefAttributes<HTMLDivElement>
  >;
  form: React.ForwardRefExoticComponent<
    React.FormHTMLAttributes<HTMLFormElement> & { asChild?: boolean } & React.RefAttributes<HTMLFormElement>
  >;
  h1: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean } & React.RefAttributes<HTMLHeadingElement>
  >;
  h2: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean } & React.RefAttributes<HTMLHeadingElement>
  >;
  h3: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean } & React.RefAttributes<HTMLHeadingElement>
  >;
  input: React.ForwardRefExoticComponent<
    React.InputHTMLAttributes<HTMLInputElement> & { asChild?: boolean } & React.RefAttributes<HTMLInputElement>
  >;
  label: React.ForwardRefExoticComponent<
    React.LabelHTMLAttributes<HTMLLabelElement> & { asChild?: boolean } & React.RefAttributes<HTMLLabelElement>
  >;
  p: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLParagraphElement> & { asChild?: boolean } & React.RefAttributes<HTMLParagraphElement>
  >;
  span: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLSpanElement> & { asChild?: boolean } & React.RefAttributes<HTMLSpanElement>
  >;
  nav: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & { asChild?: boolean } & React.RefAttributes<HTMLElement>
  >;
  section: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & { asChild?: boolean } & React.RefAttributes<HTMLElement>
  >;
  header: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & { asChild?: boolean } & React.RefAttributes<HTMLElement>
  >;
  footer: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & { asChild?: boolean } & React.RefAttributes<HTMLElement>
  >;
  main: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & { asChild?: boolean } & React.RefAttributes<HTMLElement>
  >;
  aside: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & { asChild?: boolean } & React.RefAttributes<HTMLElement>
  >;
  article: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> & { asChild?: boolean } & React.RefAttributes<HTMLElement>
  >;
  ul: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLUListElement> & { asChild?: boolean } & React.RefAttributes<HTMLUListElement>
  >;
  ol: React.ForwardRefExoticComponent<
    React.OlHTMLAttributes<HTMLOListElement> & { asChild?: boolean } & React.RefAttributes<HTMLOListElement>
  >;
  li: React.ForwardRefExoticComponent<
    React.LiHTMLAttributes<HTMLLIElement> & { asChild?: boolean } & React.RefAttributes<HTMLLIElement>
  >;
};

/**
 * Enhanced event dispatcher with flushSync for React 18+
 * Ensures DOM updates are flushed synchronously before dispatching events
 */
export const dispatchEvent = dispatchEventSync;

/**
 * Hook for combining multiple refs into a single callback ref
 * Useful when you need to forward refs while also using them internally
 */
export const useCallbackRef = useCallbackRef;

// Type exports for better TypeScript support
export type PrimitiveElement = keyof typeof Primitive;

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