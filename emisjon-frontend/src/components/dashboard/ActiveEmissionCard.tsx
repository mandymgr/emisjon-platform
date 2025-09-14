import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { Emission } from '@/types/emission';
import { Progress } from '@/components/ui/progress';

interface ActiveEmissionCardProps {
  emission: Emission;
}

// Stat sub-component for cleaner design
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 transition-colors">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-light">{label}</div>
      <div className="text-lg font-light text-card-foreground">{value}</div>
    </div>
  );
}

function ActiveEmissionCard({ emission }: ActiveEmissionCardProps) {
  const navigate = useNavigate();

  // Memoized calculations for better performance - moved before any early returns
  const { daysLeft, progress, totalValue } = useMemo(() => {
    // Defensive check for emission data
    if (!emission || typeof emission !== 'object') {
      return { daysLeft: 0, progress: 0, totalValue: 0 };
    }

    // Safe date parsing with fallbacks
    const endDate = emission.endDate ? new Date(emission.endDate) : new Date();
    const startDate = emission.startDate ? new Date(emission.startDate) : new Date();
    const now = new Date();

    // Ensure dates are valid
    if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
      return { daysLeft: 0, progress: 0, totalValue: 0 };
    }

    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, diffDays);

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsed / totalDays) * 100)) : 0;

    const shares = typeof emission.newSharesOffered === 'number' ? emission.newSharesOffered : 0;
    const price = typeof emission.pricePerShare === 'number' ? emission.pricePerShare : 0;
    const totalValue = shares * price;

    return { daysLeft, progress, totalValue };
  }, [emission]);

  // Early return after hooks to avoid conditional hook calls
  if (!emission || typeof emission !== 'object') {
    console.error('ActiveEmissionCard: Invalid emission data:', emission);
    return null;
  }

  return (
    <section
      role="region"
      aria-labelledby={`emission-${emission.id}-title`}
      className="relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      {/* Status ping - Skandinavisk elegant indicator */}
      <div className="absolute top-6 right-6">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" style={{
            animationDuration: 'var(--ping-duration, 2s)'
          }}></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </div>

      <div className="p-8">
        {/* Semantisk heading for a11y */}
        <h3 id={`emission-${emission.id}-title`} className="text-2xl font-normal tracking-tight text-foreground mb-8">
          {emission.title}
        </h3>

        {/* Key Metrics - Renere design */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Stat
            label="Shares Offered"
            value={emission.newSharesOffered ? emission.newSharesOffered.toLocaleString("nb-NO") : '0'}
          />
          <Stat
            label="Price per Share"
            value={emission.pricePerShare ? `${emission.pricePerShare.toLocaleString("nb-NO")} NOK` : '0 NOK'}
          />
        </div>

        {/* Total Value - Prominent display */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8 flex justify-between items-center">
          <span className="text-sm font-light text-muted-foreground uppercase tracking-wider">Total Value</span>
          <span className="text-xl font-light text-foreground">
            {totalValue ? totalValue.toLocaleString("nb-NO") : '0'} NOK
          </span>
        </div>

        {/* Progress - Med bedre UX og a11y */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-3">
            <span className="font-light">
              {daysLeft > 0 ? `${daysLeft} dager igjen` : "Emisjon avsluttet"}
            </span>
            <span className="font-light">{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            label="Emisjon fremdrift"
            className="h-2"
          />
        </div>

        {/* Datoer - Norsk formatering */}
        <div className="flex justify-between text-sm text-muted-foreground mb-8">
          <span className="font-light">
            Start: {emission.startDate ? new Date(emission.startDate).toLocaleDateString("nb-NO") : 'Ikke satt'}
          </span>
          <span className="font-light">
            Slutt: {emission.endDate ? new Date(emission.endDate).toLocaleDateString("nb-NO") : 'Ikke satt'}
          </span>
        </div>

        {/* CTA Button - Med bedre a11y */}
        <button
          onClick={() => navigate("/dashboard/emissions")}
          aria-label={`Se detaljer for ${emission.title}`}
          className="btn-professional w-full py-4 text-base font-medium transition-all duration-300 group-hover:scale-[1.02]"
        >
          Se detaljer
        </button>
      </div>

      {/* CSS for å respektere prefers-reduced-motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [style*="--ping-duration"] {
            --ping-duration: 0s;
            animation: none;
          }
          .transition-all, .duration-300 {
            transition: none;
          }
          .group-hover\\:scale-\\[1\\.02\\]:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

export default ActiveEmissionCard;