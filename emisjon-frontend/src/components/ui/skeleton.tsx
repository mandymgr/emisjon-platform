import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md transition-colors", className)}
      style={{
        // Respektér brukerens bevegelsesinnstillinger
        animationDuration: 'var(--skeleton-duration, 2s)',
      }}
      {...props}
    >
      {/* CSS for å redusere animasjon ved behov */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-slot="skeleton"] {
            --skeleton-duration: 0s;
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

export { Skeleton }
