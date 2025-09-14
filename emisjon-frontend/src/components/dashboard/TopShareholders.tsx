import * as React from 'react';
import { Link } from 'react-router';
import { cn } from '@/components/ui/primitive';
import { UsersIcon, UserPlusIcon, InfoIcon } from '@/components/icons';

interface Shareholder {
  id: string;
  name: string;
  email?: string;
  totalShares: number;
  totalValue: number;
  percentage: number;
  isCompany?: boolean;
}

interface ShareholderRowProps {
  shareholder: Shareholder;
  rank: number;
  className?: string;
}

function ShareholderRow({ shareholder, rank, className }: ShareholderRowProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString('nb-NO');
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors",
      className
    )}>
      <div className="flex items-center space-x-4">
        {/* Rank */}
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-sm font-light text-foreground tabular-nums">
            {rank}
          </span>
        </div>

        {/* Shareholder Info */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-light text-foreground">
              {shareholder.name}
            </h4>
            {shareholder.isCompany && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-light uppercase tracking-wider">
                Selskap
              </span>
            )}
          </div>
          {shareholder.email && (
            <p className="text-xs font-light text-muted-foreground">
              {shareholder.email}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="text-right space-y-1">
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-light text-foreground tabular-nums">
              {formatValue(shareholder.totalShares)} aksjer
            </div>
            <div className="text-xs font-light text-muted-foreground">
              {shareholder.percentage.toFixed(1)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-light text-foreground tabular-nums">
              {formatValue(shareholder.totalValue)} NOK
            </div>
            <div className="text-xs font-light text-muted-foreground">
              verdi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccessRestrictedProps {
  requiredLevel: number;
  className?: string;
}

function AccessRestricted({ requiredLevel, className }: AccessRestrictedProps) {
  return (
    <div className={cn(
      "card-professional p-8 text-center",
      className
    )}>
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <InfoIcon size={24} className="text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-light text-foreground">
            Tilgang kreves
          </h3>
          <p className="text-sm font-light text-muted-foreground">
            Nivå {requiredLevel}+ tilgang kreves for å se aksjonærinformasjon
          </p>
        </div>
      </div>
    </div>
  );
}

interface TopShareholdersProps {
  shareholders: Shareholder[];
  userLevel?: number;
  loading?: boolean;
  error?: string;
  className?: string;
  maxItems?: number;
}

export function TopShareholders({
  shareholders,
  userLevel = 1,
  loading = false,
  error,
  className,
  maxItems = 5
}: TopShareholdersProps) {
  const requiredLevel = 2;
  const hasAccess = userLevel >= requiredLevel;

  // Sort shareholders by total value and take top N
  const topShareholders = React.useMemo(() => {
    return shareholders
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, maxItems);
  }, [shareholders, maxItems]);

  const totalOthers = React.useMemo(() => {
    if (shareholders.length <= maxItems) return null;

    const othersCount = shareholders.length - maxItems;
    const othersValue = shareholders
      .slice(maxItems)
      .reduce((sum, s) => sum + s.totalValue, 0);
    const othersShares = shareholders
      .slice(maxItems)
      .reduce((sum, s) => sum + s.totalShares, 0);

    return {
      count: othersCount,
      totalValue: othersValue,
      totalShares: othersShares
    };
  }, [shareholders, maxItems]);

  // Loading skeleton
  if (loading) {
    return (
      <section className={cn("space-y-8", className)}>
        <div className="space-y-2">
          <h2 className="heading-professional text-title-large font-light">
            Topp aksjonærer
          </h2>
          <p className="text-sm font-light text-muted-foreground">
            Største investorer etter verdi
          </p>
        </div>

        <div className="card-professional">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted/30 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/30 rounded w-32"></div>
                    <div className="h-3 bg-muted/30 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 bg-muted/30 rounded w-20"></div>
                  <div className="h-3 bg-muted/30 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
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
            Topp aksjonærer
          </h2>
        </div>

        <div className="card-professional p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <InfoIcon size={24} className="text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Kunne ikke laste aksjonærer
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="heading-professional text-title-large font-light">
            Topp aksjonærer
          </h2>
          <p className="text-sm font-light text-muted-foreground">
            Største investorer etter verdi
          </p>
        </div>

        {hasAccess && (
          <Link
            to="/shareholders"
            className="btn-professional-ghost"
          >
            <UsersIcon size={16} />
            <span>Se alle</span>
          </Link>
        )}
      </div>

      {!hasAccess ? (
        <AccessRestricted requiredLevel={requiredLevel} />
      ) : topShareholders.length === 0 ? (
        <div className="card-professional p-8 text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <UserPlusIcon size={24} className="text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Ingen aksjonærer enda
              </h3>
              <p className="text-sm font-light text-muted-foreground">
                Aksjonærer vil vises her når de første investeringene er registrert
              </p>
            </div>
            <Link
              to="/shareholders/add"
              className="btn-professional"
            >
              <UserPlusIcon size={16} />
              <span>Legg til aksjonær</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="card-professional">
          <div className="divide-y divide-border/50">
            {topShareholders.map((shareholder, index) => (
              <ShareholderRow
                key={shareholder.id}
                shareholder={shareholder}
                rank={index + 1}
              />
            ))}

            {totalOthers && (
              <div className="flex items-center justify-between p-4 bg-muted/30">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-light text-muted-foreground">
                      +{totalOthers.count}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-light text-muted-foreground">
                      {totalOthers.count} andre aksjonærer
                    </h4>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-light text-muted-foreground tabular-nums">
                        {totalOthers.totalShares.toLocaleString('nb-NO')} aksjer
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-light text-muted-foreground tabular-nums">
                        {(totalOthers.totalValue / 1000).toFixed(0)}K NOK
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border/50">
            <Link
              to="/shareholders"
              className="btn-professional-outline w-full"
            >
              <UsersIcon size={16} />
              <span>Se alle aksjonærer</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export default TopShareholders;