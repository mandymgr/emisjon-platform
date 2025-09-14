import * as React from 'react';
import { cn } from '@/components/ui/primitive';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
}

function StatsCard({
  title,
  value,
  subtitle,
  change,
  loading = false,
  className
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("card-professional p-8", className)}>
        <div className="space-y-6 animate-pulse">
          <div className="h-3 bg-muted/30 rounded w-24"></div>
          <div className="h-10 bg-muted/30 rounded w-32"></div>
          {subtitle && <div className="h-3 bg-muted/30 rounded w-20"></div>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "card-professional p-8 group hover:border-primary/20 transition-all duration-300",
      className
    )}>
      <div className="space-y-6">
        <div className="text-caption text-muted-foreground">
          {title}
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-light text-foreground tracking-tight tabular-nums">
            {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
          </div>

          {subtitle && (
            <div className="text-sm font-light text-muted-foreground">
              {subtitle}
            </div>
          )}

          {change && (
            <div className={cn(
              "text-xs font-light flex items-center space-x-1",
              change.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              <span className="inline-block w-3 h-3 text-center leading-none">
                {change.isPositive ? '▲' : '▼'}
              </span>
              <span>{change.value}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  portfolioValue?: number;
  annualizedReturn?: number;
  totalUsers?: number;
  totalShareholders?: number;
  totalShares?: number;
  activeProjects?: number;
  userLevel?: number;
  loading?: boolean;
  className?: string;
}

export function StatsGrid({
  portfolioValue,
  annualizedReturn,
  totalUsers,
  totalShareholders,
  totalShares,
  activeProjects,
  userLevel = 1,
  loading = false,
  className
}: StatsGridProps) {
  const stats = React.useMemo(() => {
    const allStats = [
      // Always visible
      {
        title: 'Porteføljeverdi',
        value: portfolioValue ? `${(portfolioValue / 1000000).toFixed(1)}M` : '—',
        subtitle: 'NOK',
        change: portfolioValue ? { value: '4.8% YoY', isPositive: true } : undefined,
      },
      {
        title: 'Årlig avkastning',
        value: annualizedReturn ? `${annualizedReturn.toFixed(1)}%` : '—',
        subtitle: 'Gjennomsnitt',
        change: annualizedReturn ? { value: '0.3% fra forrige kvartal', isPositive: true } : undefined,
      },

      // Admin only (level 3+)
      ...(userLevel >= 3 ? [{
        title: 'Totalt brukere',
        value: totalUsers ?? '—',
        subtitle: 'Registrerte',
        change: totalUsers ? { value: '12.5% denne måneden', isPositive: true } : undefined,
      }] : []),

      // Level 2+
      ...(userLevel >= 2 ? [
        {
          title: 'Aksjonærer',
          value: totalShareholders ?? '—',
          subtitle: 'Aktive investorer',
          change: totalShareholders ? { value: '8.3% denne måneden', isPositive: true } : undefined,
        },
        {
          title: 'Total aksjer',
          value: totalShares ?? '—',
          subtitle: 'Utstedt',
        }
      ] : []),

      // Always visible
      {
        title: 'Aktive prosjekter',
        value: activeProjects ?? '—',
        subtitle: 'Pågående emisjoner',
      }
    ];

    return allStats;
  }, [portfolioValue, annualizedReturn, totalUsers, totalShareholders, totalShares, activeProjects, userLevel]);

  return (
    <section className={cn("space-y-8", className)}>
      <div className="space-y-2">
        <h2 className="heading-professional text-title-large font-light">
          Oversikt
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Nøkkeltall for ditt dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatsCard
            key={`${stat.title}-${index}`}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            change={stat.change}
            loading={loading}
          />
        ))}
      </div>
    </section>
  );
}

export default StatsGrid;