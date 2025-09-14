import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

// Enhanced Progress with better a11y and Norwegian support
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    label?: string;
  }
>(({ className, value, label, ...props }, ref) => {
  const clamped = typeof value === "number" ? Math.max(0, Math.min(100, value)) : null;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-muted transition-colors",
        className
      )}
      aria-label={label}
      aria-valuetext={typeof clamped === "number" ? `${clamped}%` : undefined}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(-${100 - (clamped ?? 0)}%)`,
          // Reduser animasjon for brukere som ønsker det
          transition: 'var(--motion-reduce, transform 300ms ease-out)'
        }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

// Simplified version without Radix (as per your suggestion)
type SimpleProgressProps = {
  value?: number | null; // 0–100 (null = indeterminate)
  label?: string;        // aria-label
  className?: string;
};

export function SimpleProgress({ value = null, label, className = "" }: SimpleProgressProps) {
  const clamped = typeof value === "number" ? Math.max(0, Math.min(100, value)) : null;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped ?? undefined}
      aria-valuetext={typeof clamped === "number" ? `${clamped}%` : undefined}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-muted transition-colors",
        className
      )}
      style={{
        // CSS variables for motion preferences
        '--motion-reduce': 'none'
      }}
    >
      <div
        className="h-full w-full bg-primary transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(-${100 - (clamped ?? 0)}%)`,
          transition: 'var(--motion-reduce, transform 300ms ease-out)'
        }}
      />

      {/* Reduser bevegelse via CSS */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [style*="--motion-reduce"] {
            --motion-reduce: none !important;
          }
          .duration-300 {
            transition-duration: 0s;
          }
        }
      `}</style>
    </div>
  );
}

export { Progress }