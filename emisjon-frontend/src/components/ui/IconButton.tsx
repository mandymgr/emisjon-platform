import * as React from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tooltip?: string;      // valgfritt: native title
  pressed?: boolean;     // for toggles
  size?: "sm" | "md";
};

export function IconButton({
  className,
  tooltip,
  pressed,
  size = "md",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      aria-pressed={pressed}
      title={tooltip}
      className={cn(
        "inline-grid place-items-center rounded-md border transition-all duration-200",
        "border-[#E6E6E0] bg-white/90 hover:bg-black/5",
        "dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-transparent",
        "disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" ? "h-8 w-8" : "h-9 w-9",
        // Pressed state styling
        pressed && "bg-black/10 dark:bg-white/20",
        className
      )}
    />
  );
}