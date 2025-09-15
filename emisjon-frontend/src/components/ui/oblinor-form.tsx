"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Enhanced Button with Oblinor styling
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-light tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#124F62] text-white hover:bg-[#0C3C4A] dark:hover:bg-[#278899]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-[#124F62] bg-background text-[#124F62] hover:bg-[#124F62] hover:text-white dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-[#124F62]",
        secondary: "bg-[#E8E8F0] text-[#0E1A1C] hover:bg-[#E6E6E0] dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
        ghost: "text-[#124F62] hover:bg-[#124F62]/10 dark:text-white dark:hover:bg-white/10",
        link: "text-[#124F62] underline-offset-4 hover:underline dark:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Enhanced Input with Scandinavian styling
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#E6E6E0] bg-white px-3 py-2 text-sm font-light placeholder:text-muted-foreground transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50",
          "file:border-0 file:bg-transparent file:text-sm file:font-light",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// Enhanced Label with Scandinavian typography
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#0E1A1C] dark:text-white tracking-wide",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// React Hook Form integration
const Form = FormProvider;

type FormFieldContextValue = {
  name: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends Record<string, any> = Record<string, any>,
  TName extends string = string
>({
  ...props
}: any) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name as string, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

// Enhanced FormLabel with Scandinavian style
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        "text-sm font-light uppercase tracking-[0.05em] text-black/80 dark:text-white/80",
        error && "text-red-500 dark:text-red-400",
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// Scandinavian form description
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(
        "text-xs font-light text-black/60 dark:text-white/60 leading-relaxed",
        className
      )}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// Enhanced error message with Scandinavian styling
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-xs font-light text-red-500 dark:text-red-400 mt-1 flex items-center gap-1",
        className
      )}
      {...props}
    >
      <span className="inline-block w-1 h-1 bg-red-500 dark:bg-red-400 rounded-full" aria-hidden="true" />
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  Button,
  buttonVariants,
  Input,
  Label,
};