import { Link } from 'react-router';
import { cn } from '@/components/ui/primitive';
import { CalendarIcon, InfoIcon, CurrencyIcon } from '@/components/icons';
import type { Emission } from '@/services/emissionsService';

interface EmissionCardProps {
  emission: Emission;
  className?: string;
}

function EmissionCard({ emission, className }: EmissionCardProps) {
  const progressPercentage = emission.targetAmount
    ? Math.min((emission.raisedAmount || 0) / emission.targetAmount * 100, 100)
    : 0;

  const getStatusBadge = (status: Emission['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge-active">Aktiv</span>;
      case 'FUNDED':
        return <span className="badge-funded">Finansiert</span>;
      case 'DRAFT':
        return <span className="badge-draft">Utkast</span>;
      case 'CLOSED':
        return <span className="badge-draft">Lukket</span>;
      case 'CANCELLED':
        return <span className="badge-draft">Kansellert</span>;
      default:
        return <span className="badge-draft">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString('nb-NO');
  };

  return (
    <Link
      to={`/emissions/${emission.id}`}
      className={cn(
        "card-professional p-6 block hover:scale-[1.02] transition-all duration-300",
        className
      )}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-light text-lg text-foreground line-clamp-2 leading-relaxed">
              {emission.title}
            </h3>
            {getStatusBadge(emission.status)}
          </div>

          {emission.description && (
            <p className="text-sm font-light text-muted-foreground line-clamp-2 leading-relaxed">
              {emission.description}
            </p>
          )}
        </div>

        {/* Project Details */}
        {emission.projectDetails && (
          <div className="space-y-3">
            {emission.projectDetails.location && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <InfoIcon size={16} className="opacity-60" />
                <span className="font-light">{emission.projectDetails.location}</span>
              </div>
            )}

            {emission.projectDetails.expectedReturn && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CurrencyIcon size={16} className="opacity-60" />
                <span className="font-light">
                  {emission.projectDetails.expectedReturn}% forventet avkastning
                </span>
              </div>
            )}
          </div>
        )}

        {/* Financial Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-caption text-muted-foreground mb-1">
                Pris per aksje
              </div>
              <div className="font-light text-foreground tabular-nums">
                {formatCurrency(emission.pricePerShare)} NOK
              </div>
            </div>
            <div>
              <div className="text-caption text-muted-foreground mb-1">
                Aksjer tilgjengelig
              </div>
              <div className="font-light text-foreground tabular-nums">
                {emission.newSharesOffered.toLocaleString('nb-NO')}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {emission.targetAmount && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-light text-muted-foreground">
                  {formatCurrency(emission.raisedAmount || 0)} NOK innsamlet
                </span>
                <span className="font-light text-muted-foreground">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemax={100}
                  aria-label={`${progressPercentage.toFixed(1)}% av målet oppnådd`}
                />
              </div>
              <div className="text-xs font-light text-muted-foreground">
                Mål: {formatCurrency(emission.targetAmount)} NOK
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <CalendarIcon size={14} className="opacity-60" />
            <span className="font-light">
              Slutter {new Date(emission.endDate).toLocaleDateString('nb-NO', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface AccessRestrictedCardProps {
  requiredLevel: number;
  className?: string;
}

function AccessRestrictedCard({ requiredLevel, className }: AccessRestrictedCardProps) {
  return (
    <div className={cn(
      "card-professional p-8 text-center",
      className
    )}>
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <InfoIcon size={24} className="text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-light text-foreground">
            Tilgang kreves
          </h3>
          <p className="text-sm font-light text-muted-foreground">
            Nivå {requiredLevel}+ tilgang kreves for å se aktive emisjoner
          </p>
        </div>
      </div>
    </div>
  );
}

interface ActiveEmissionsProps {
  emissions: Emission[];
  userLevel?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function ActiveEmissions({
  emissions,
  userLevel = 1,
  loading = false,
  error,
  className
}: ActiveEmissionsProps) {
  const requiredLevel = 3;
  const hasAccess = userLevel >= requiredLevel;

  // Loading skeleton
  if (loading) {
    return (
      <section className={cn("space-y-8", className)}>
        <div className="space-y-2">
          <h2 className="heading-professional text-title-large font-light">
            Aktive emisjoner
          </h2>
          <p className="text-sm font-light text-muted-foreground">
            Pågående investeringsmuligheter
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card-professional p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-muted/30 rounded w-3/4"></div>
                <div className="h-4 bg-muted/30 rounded w-full"></div>
                <div className="h-4 bg-muted/30 rounded w-2/3"></div>
                <div className="h-2 bg-muted/30 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={cn("space-y-8", className)}>
        <div className="space-y-2">
          <h2 className="heading-professional text-title-large font-light">
            Aktive emisjoner
          </h2>
        </div>

        <div className="card-professional p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <InfoIcon size={24} className="text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Kunne ikke laste emisjoner
              </h3>
              <p className="text-sm font-light text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("space-y-8", className)}>
      <div className="space-y-2">
        <h2 className="heading-professional text-title-large font-light">
          Aktive emisjoner
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Pågående investeringsmuligheter
        </p>
      </div>

      {!hasAccess ? (
        <AccessRestrictedCard requiredLevel={requiredLevel} />
      ) : emissions.length === 0 ? (
        <div className="card-professional p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <InfoIcon size={24} className="text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Ingen aktive emisjoner
              </h3>
              <p className="text-sm font-light text-muted-foreground">
                Det er ingen pågående investeringsmuligheter for øyeblikket
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {emissions.map((emission) => (
            <EmissionCard
              key={emission.id}
              emission={emission}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ActiveEmissions;