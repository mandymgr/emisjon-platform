import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";

/**
 * Enhanced useForm hook with Zod schema integration
 * Provides type-safe forms with automatic validation
 *
 * @param schema - Zod schema for validation
 * @param formProps - Additional useForm props
 * @returns UseFormReturn with inferred types from schema
 */
export function useZodForm<TSchema extends z.ZodType<any, any>>(
  schema: TSchema,
  formProps?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...formProps,
  });
}

/**
 * Type utility to infer schema type
 */
export type InferSchema<TSchema extends z.ZodType<any, any>> = z.infer<TSchema>;

/**
 * Type utility for form field names
 */
export type FormFieldNames<TSchema extends z.ZodType<any, any>> = keyof z.infer<TSchema>;

/**
 * Hook for form with async validation
 * Useful for forms that need server-side validation
 */
export function useAsyncZodForm<TSchema extends z.ZodType<any, any>>(
  schema: TSchema,
  formProps?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: "onBlur", // Enable validation on blur for better UX
    ...formProps,
  });
}