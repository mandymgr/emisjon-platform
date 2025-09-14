import * as React from 'react';
import { FiActivity, FiBarChart2 } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import type { Shareholder } from '@/components/shareholder/types';

interface ShareholdersChartProps {
  shareholders: Shareholder[];
  totalShares: number;
  loading?: boolean;
  /** ARIA label for chart region */
  ariaLabel?: string;
}

export default function ShareholdersChart({ shareholders, totalShares, loading = false, ariaLabel }: ShareholdersChartProps) {
  const { formatNumber } = useNorwegianNumber();
  const chartId = React.useId();

  // Memoized chart data for better performance
  const chartData = React.useMemo(() =>
    shareholders.map((sh) => ({
      name: sh.name.length > 15 ? sh.name.substring(0, 15) + '...' : sh.name,
      shares: sh.shares,
      fullName: sh.name
    })), [shareholders]
  );

  const CustomTooltip = React.useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-lg backdrop-blur-sm transition-colors">
          <p className="text-popover-foreground text-sm font-light mb-2">{data.fullName}</p>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-muted-foreground text-xs font-light uppercase tracking-wider">Aksjer:</span>
            <span className="text-popover-foreground font-light text-sm">
              {formatNumber(data.shares)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  }, [formatNumber]);

  return (
    <section
      role="region"
      aria-label={ariaLabel || "Aksjonæroversikt"}
      aria-labelledby={!ariaLabel ? chartId : undefined}
      className="relative bg-card border border-border rounded-2xl p-8 transition-colors"
    >
      {/* Semantisk heading for a11y */}
      <header className="flex items-center justify-between mb-8">
        <h3 id={chartId} className="text-xs font-light text-muted-foreground uppercase tracking-wider">
          Nåværende aksjeeierskap
        </h3>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 rounded-lg transition-colors">
          <FiBarChart2 className="w-4 h-4 text-primary" aria-hidden="true" />
          <span className="text-xs font-light text-primary uppercase tracking-wider">Oversikt</span>
        </div>
      </header>
      
      {loading ? (
        <ShareholdersChartSkeleton />
      ) : chartData.length > 0 ? (
        <>
          <div
            role="img"
            aria-label="Graf over aksjeeierskap fordelt på aksjonærer"
            className="chart-container"
          >
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                style={{
                  // Respektér brukerens bevegelsesinnstillinger
                  animationDuration: 'var(--chart-animation-duration, 1200ms)'
                }}
              >
                <defs>
                  <linearGradient id="colorGradientLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorGradientDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight="300"
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.3 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight="300"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toLocaleString('nb-NO')}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="shares"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorGradientLight)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <ShareholdersLegend shareholders={shareholders} totalShares={totalShares} />
        </>
      ) : (
        <div className="h-[320px] flex items-center justify-center">
          <div className="text-center">
            <FiActivity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" aria-hidden="true" />
            <h4 className="text-lg font-light text-muted-foreground mb-2">Ingen aksjonærdata</h4>
            <p className="text-sm font-light text-muted-foreground/80">
              Data for aksjeeierskap er ikke tilgjengelig for øyeblikket.
            </p>
          </div>
        </div>
      )}

      {/* CSS for å respektere prefers-reduced-motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .chart-container [style*="--chart-animation-duration"] {
            --chart-animation-duration: 0s;
          }
          .transition-colors {
            transition: none;
          }
          [animationDuration] {
            animation-duration: 0s !important;
          }
        }
      `}</style>
    </section>
  );
}

function ShareholdersLegend({ shareholders, totalShares }: { shareholders: Shareholder[]; totalShares: number }) {
  const { formatNumber } = useNorwegianNumber();
  const legendId = React.useId();

  return (
    <section
      role="region"
      aria-labelledby={`${legendId}-title`}
      className="mt-8"
    >
      <h4
        id={`${legendId}-title`}
        className="sr-only"
      >
        Detaljert oversikt over aksjonærer
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shareholders.map((sh, index) => (
          <div
            key={`${sh.name}-${index}`}
            className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50"
          >
            <div
              className="w-3 h-3 rounded-full bg-primary shadow-sm flex-shrink-0"
              style={{
                opacity: Math.max(0.3, 1 - (index * 0.12)),
                // Skandinavisk gradient approach
                background: `hsl(var(--primary) / ${Math.max(0.3, 1 - (index * 0.12))})`
              }}
              aria-hidden="true"
            />
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span
                className="text-muted-foreground font-light truncate text-sm"
                title={sh.name}
              >
                {sh.name}
              </span>
              <span className="text-card-foreground font-light ml-3 tabular-nums text-sm">
                {formatNumber(sh.shares)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total - Skandinavisk elegant separator */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <span className="text-sm text-muted-foreground font-light uppercase tracking-wider">
            Totale aksjer
          </span>
          <span className="text-lg font-light text-foreground tabular-nums">
            {formatNumber(totalShares)}
          </span>
        </div>
      </div>
    </section>
  );
}

function ShareholdersChartSkeleton() {
  return (
    <div
      role="status"
      aria-label="Laster aksjonærgraf..."
      className="animate-pulse"
    >
      <div className="h-[400px] relative rounded-lg bg-muted/20 mb-8">
        <div className="absolute bottom-0 left-0 right-0 flex justify-around p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <Skeleton
                className="w-12 rounded-sm"
                style={{ height: `${Math.max(40, (5-i) * 30)}px` }}
              />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Legend skeleton med samme struktur som ekte */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
            <Skeleton className="w-3 h-3 rounded-full flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between min-w-0">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <Skeleton className="h-4 w-12 ml-3 rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}