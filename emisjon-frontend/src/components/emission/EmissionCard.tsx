import type { Emission } from '@/types/emission';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';

export default function EmissionCard({
  emission,
  onClick,
}: {
  emission: Emission;
  onClick?: () => void;
}) {
  const { formatCurrency, formatNumber } = useNorwegianNumber();

  const badge = (() => {
    switch (emission.status) {
      case 'PREVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-white text-gray-800 border border-gray-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700';
      case 'FINALIZED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  })();

  const totalValue = emission.newSharesOffered * emission.pricePerShare;

  return (
    <article
      className="rounded-2xl bg-white border border-gray-200 p-6 shadow-soft hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-700"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`Åpne detaljer for emisjon ${emission.title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-serif text-xl text-teal-900">{emission.title}</h3>
        <span className={`px-3 py-1 text-xs rounded-full ${badge}`}>{emission.status}</span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: emission.description || '' }} />

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Pris pr. aksje</dt>
          <dd className="font-medium text-gray-900">{formatCurrency(emission.pricePerShare)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Nye aksjer</dt>
          <dd className="font-medium text-gray-900">{formatNumber(emission.newSharesOffered)}</dd>
        </div>
        <div className="flex items-center justify-between col-span-2 border-t border-gray-200 pt-3">
          <dt className="text-gray-500">Total verdi</dt>
          <dd className="font-medium text-gray-900">{formatCurrency(totalValue)}</dd>
        </div>
      </dl>
    </article>
  );
}