import * as React from 'react';

/**
 * Enhanced context utilities for React components
 * Based on Radix UI patterns for compound components and scoped contexts
 */

export interface ContextScope {
  [scopeName: string]: React.Context<any>[];
}

export type Scope<C = any> = {
  [scopeName: string]: React.Context<C>;
} | undefined;

export type ScopeHook = (scope: Scope) => {
  [__scopeProp: string]: Scope;
};

/**
 * Creates a simple React Context with provider and hook
 *
 * @param name - Display name for the context
 * @param defaultValue - Default value if no provider is found
 * @returns Tuple of [Provider, useHook]
 */
export function createContext<T>(
  name: string,
  defaultValue?: T
): [
  React.FC<React.PropsWithChildren<{ value: T }>>,
  (hookName?: string) => T
] {
  const Context = React.createContext<T | undefined>(defaultValue);

  const Provider: React.FC<React.PropsWithChildren<{ value: T }>> = ({
    children,
    value
  }) => {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };
  Provider.displayName = `${name}Provider`;

  function useContext(hookName: string = `use${name}`): T {
    const ctx = React.useContext(Context);
    if (ctx !== undefined) return ctx;
    if (defaultValue !== undefined) return defaultValue;

    throw new Error(
      `\`${hookName}\` must be used within \`${name}Provider\`. ` +
      `Make sure to wrap your component with <${name}Provider>.`
    );
  }

  return [Provider, useContext] as const;
}

/**
 * Creates a scoped context that supports multiple overlapping providers
 * Useful for compound components that can be nested
 *
 * @param name - Display name for the context
 * @param defaultContexts - Array of default contexts
 * @returns Array of [Provider, useHook, createScope]
 */
export function createContextScope<ContextValueType extends Record<string, any>>(
  name: string,
  defaultContexts: ContextValueType[] = []
): [
  React.FC<React.PropsWithChildren<ContextValueType & { scope?: Scope }>>,
  (scope?: Scope, hookName?: string) => ContextValueType,
  (...scopes: Array<Scope | undefined>) => React.FC<React.PropsWithChildren>,
  () => Scope
] {
  const defaultScope: Scope = defaultContexts.reduce((scopeObj, contextValue, index) => {
    const Context = React.createContext<ContextValueType | undefined>(contextValue);
    return {
      ...scopeObj,
      [`__scope${name}${index}`]: Context,
    };
  }, {});

  function createScope(...scopes: Array<Scope | undefined>): React.FC<React.PropsWithChildren> {
    const scopeObj = scopes.reduce((acc, scope) => ({ ...acc, ...scope }), {});
    return React.memo(React.forwardRef<HTMLDivElement, React.PropsWithChildren>(
      ({ children }, _) => React.createElement(React.Fragment, null, children)
    ));
  }

  const BaseContext = React.createContext<ContextValueType | undefined>(
    defaultContexts[0]
  );

  function Provider({
    scope,
    children,
    ...context
  }: React.PropsWithChildren<ContextValueType & { scope?: Scope }>) {
    const Context = (scope && scope[`__scope${name}`]) || BaseContext;
    return (
      <Context.Provider value={context as ContextValueType}>
        {children}
      </Context.Provider>
    );
  }
  Provider.displayName = `${name}Provider`;

  function useContext(scope?: Scope, hookName: string = `use${name}`): ContextValueType {
    const Context = (scope && scope[`__scope${name}`]) || BaseContext;
    const ctx = React.useContext(Context);

    if (ctx) return ctx;

    if (defaultContexts[0] !== undefined) return defaultContexts[0];

    throw new Error(
      `\`${hookName}\` must be used within \`${name}Provider\`. ` +
      `Make sure to wrap your component with <${name}Provider>.`
    );
  }

  function getScope(): Scope {
    return defaultScope;
  }

  return [Provider, useContext, createScope, getScope] as const;
}

/**
 * Composes multiple scopes together
 *
 * @param scopes - Array of scopes to compose
 * @returns Composed scope component
 */
export function composeScopes(...scopes: Array<Scope | undefined>): React.FC<React.PropsWithChildren> {
  const baseScopeComponent = scopes[0];

  if (scopes.length === 1) {
    return baseScopeComponent as React.FC<React.PropsWithChildren>;
  }

  const ScopedComponent = scopes.reduce((Acc, Scope) => {
    return React.forwardRef<HTMLDivElement, React.PropsWithChildren>(({ children }, _) => {
      if (Scope) {
        return React.createElement(Scope, null, children);
      }
      if (Acc) {
        return React.createElement(Acc, null, children);
      }
      return React.createElement(React.Fragment, null, children);
    });
  });

  ScopedComponent.displayName = 'ComposedScopes';

  return ScopedComponent as React.FC<React.PropsWithChildren>;
}

/**
 * Hook to safely use context with better error messages
 *
 * @param Context - React Context to use
 * @param hookName - Name of the hook for error messages
 * @param providerName - Name of the provider for error messages
 */
export function useContextWithError<T>(
  Context: React.Context<T | undefined>,
  hookName: string,
  providerName: string
): NonNullable<T> {
  const ctx = React.useContext(Context);

  if (ctx === undefined) {
    throw new Error(
      `\`${hookName}\` must be used within \`${providerName}\`. ` +
      `Make sure to wrap your component with <${providerName}>.`
    );
  }

  return ctx as NonNullable<T>;
}

/**
 * Creates a context with optional value (no error if not provided)
 *
 * @param name - Display name for the context
 * @param defaultValue - Default value
 */
export function createOptionalContext<T>(
  name: string,
  defaultValue?: T
): [
  React.FC<React.PropsWithChildren<{ value?: T }>>,
  () => T | undefined
] {
  const Context = React.createContext<T | undefined>(defaultValue);

  const Provider: React.FC<React.PropsWithChildren<{ value?: T }>> = ({
    children,
    value = defaultValue
  }) => {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };
  Provider.displayName = `${name}Provider`;

  function useOptionalContext(): T | undefined {
    return React.useContext(Context);
  }

  return [Provider, useOptionalContext] as const;
}

// Type utilities for better developer experience
export type CreateContextReturn<T> = ReturnType<typeof createContext<T>>;
export type CreateContextScopeReturn<T extends Record<string, any>> = ReturnType<
  typeof createContextScope<T>
>;

/**
 * Utility for creating strongly typed context hooks
 */
export function createTypedContext<T>() {
  return {
    createContext: (name: string, defaultValue?: T) => createContext<T>(name, defaultValue),
    createOptionalContext: (name: string, defaultValue?: T) => createOptionalContext<T>(name, defaultValue),
  };
}

// Common context patterns for UI components
export const createFormContext = createTypedContext<{
  register: any;
  formState: any;
  watch: any;
  setValue: any;
  getValues: any;
}>();

export const createThemeContext = createTypedContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>();

export const createModalContext = createTypedContext<{
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}>();

export default {
  createContext,
  createContextScope,
  createOptionalContext,
  composeScopes,
  useContextWithError,
  createTypedContext,
};