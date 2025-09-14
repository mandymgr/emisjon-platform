import * as React from "react";

type AccessRestrictedCardProps = {
  requiredLevel?: number;
  /** Overstyr hovedtittel (ellers genereres ut fra requiredLevel) */
  title?: string;
  /** Overstyr beskrivelsen (ellers genereres ut fra requiredLevel) */
  message?: string;
  /** Ekstra klasser (Tailwind / DS tokens) */
  className?: string;
  /** ARIA label for region hvis du ønsker å navngi seksjonen eksplisitt */
  ariaLabel?: string;
};

function AccessRestrictedCard({
  requiredLevel,
  title,
  message,
  className = "",
  ariaLabel,
}: AccessRestrictedCardProps) {
  // Norsk standardtekst (passer med nb-NO ellers i appen)
  const heading =
    title ??
    (typeof requiredLevel === "number"
      ? `Tilgangsnivå ${requiredLevel} påkrevd`
      : "Begrenset tilgang");

  const description =
    message ??
    (typeof requiredLevel === "number"
      ? `Dette innholdet er tilgjengelig for brukere med nivå ${requiredLevel}.`
      : "Dette innholdet krever høyere tilgangsnivå.");

  const regionId = React.useId();

  return (
    <section
      role="region"
      aria-label={ariaLabel}
      aria-labelledby={!ariaLabel ? regionId : undefined}
      className={`relative ${className}`}
    >
      <div className="bg-card border border-border backdrop-blur-sm rounded-2xl p-12 shadow-sm transition-colors">
        <div className="text-center">
          {/* Dekorativt ikon – skjules for skjermleser */}
          <div
            aria-hidden="true"
            className="mx-auto mb-6 h-12 w-12 rounded-full border border-border bg-muted/50 grid place-items-center"
          >
            <span className="block h-[18px] w-[18px] rounded-[3px] bg-primary" />
          </div>

          <h2 id={regionId} className="text-2xl font-normal tracking-tight text-foreground mb-3">
            {heading}
          </h2>

          <p className="text-base font-light text-muted-foreground leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        </div>
      </div>

      {/* Reduser bevegelse – ingen animasjoner hvis brukeren ønsker det */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .transition-colors {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}

export default AccessRestrictedCard;