import { useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import * as emissionsService from '../services/emissionsService';
import type { Emission } from '@/types/emission';
import { useAppSelector } from '@/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessRestrictedCard } from '@/components/dashboard';
import AddEmissionModal from '../../components/AddEmissionModal';
import EditEmissionModal from '../../components/EditEmissionModal';
import DeleteEmissionModal from '../../components/DeleteEmissionModal';
import SubscribeModal from '@/components/emission/SubscribeModal';
import EmissionDetailsModal from '@/components/emission/EmissionDetailsModal';
import SuccessDialog from '@/components/ui/SuccessDialog';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { getTextPreview } from '@/utils/htmlUtils';
import PageLayout from '@/components/layout/PageLayout';
import EmissionCard from '@/components/emission/EmissionCard';

export default function EmissionsPage() {
  const { user } = useAppSelector(s => s.auth);
  const isAdmin = user?.role === 'ADMIN';
  const canView = user?.level >= 2 || isAdmin;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emissions, setEmissions] = useState<Emission[]>([]);

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Emission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Emission | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Emission | null>(null);
  const [subscribeTarget, setSubscribeTarget] = useState<Emission | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Finalize flow
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [emissionToFinalize, setEmissionToFinalize] = useState<Emission | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await emissionsService.getAllEmissions?.() || await emissionsService.getEmissions?.();
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      // sørg for at beskrivelse ikke sprenger kortene
      const withPreview = list.map((e: Emission) => ({
        ...e,
        description: e.description ? getTextPreview(e.description, 220) : '',
      }));
      setEmissions(withPreview);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Kunne ikke hente emisjoner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const actions = useMemo(() => (
    isAdmin ? (
      <button
        onClick={() => setShowAdd(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-teal-900 text-teal-900 px-4 py-2 hover:bg-teal-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-teal-700"
        aria-label="Opprett ny emisjon"
      >
        <FiPlus />
        Ny emisjon
      </button>
    ) : null
  ), [isAdmin]);

  if (!canView) {
    return (
      <PageLayout
        title="Emisjoner"
        subtitle="Du må ha riktig tilgangsnivå for å se emisjoner"
      >
        <AccessRestrictedCard />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Aktive emisjoner"
      subtitle="Velg en emisjon for detaljer, dokumenter og tegning"
      actions={actions}
    >
      {/* Loading */}
      {loading && (
        <div role="status" aria-busy="true" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 text-red-800 p-4">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && emissions.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-gray-600">Ingen emisjoner tilgjengelig akkurat nå.</p>
        </div>
      )}

      {/* List */}
      {!loading && !error && emissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {emissions.map((emission) => (
            <EmissionCard
              key={emission.id}
              emission={emission}
              onClick={() => setDetailsTarget(emission)}
            />
          ))}
        </div>
      )}

      {/* Modaler */}
      {showAdd && (
        <AddEmissionModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            setSuccessMsg('Emisjonen ble opprettet');
            load();
          }}
        />
      )}

      {editTarget && (
        <EditEmissionModal
          isOpen={!!editTarget}
          emission={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null);
            setSuccessMsg('Emisjonen ble oppdatert');
            load();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteEmissionModal
          isOpen={!!deleteTarget}
          emission={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return;
            try {
              await emissionsService.deleteEmission(deleteTarget.id);
              setDeleteTarget(null);
              setSuccessMsg('Emisjonen ble slettet');
              load();
            } catch (e: any) {
              setSuccessMsg('Kunne ikke slette emisjonen');
            }
          }}
        />
      )}

      {subscribeTarget && (
        <SubscribeModal
          isOpen={!!subscribeTarget}
          emission={{
            id: subscribeTarget.id,
            title: subscribeTarget.title,
            pricePerShare: subscribeTarget.pricePerShare,
            newSharesOffered: subscribeTarget.newSharesOffered,
          }}
          onClose={() => setSubscribeTarget(null)}
          onSuccess={() => {
            setSubscribeTarget(null);
            setSuccessMsg('Tegning sendt til vurdering');
            load();
          }}
        />
      )}

      {detailsTarget && (
        <EmissionDetailsModal
          isOpen={!!detailsTarget}
          emission={detailsTarget}
          onClose={() => setDetailsTarget(null)}
          onSubscribe={() => setSubscribeTarget(detailsTarget!)}
          onComplete={() => {
            setEmissionToFinalize(detailsTarget);
            setShowFinalizeModal(true);
          }}
          onActivate={async () => {
            try {
              await emissionsService.activateEmission?.(detailsTarget!.id);
              setSuccessMsg('Emisjonen er aktivert');
              load();
            } catch (e: any) {
              setSuccessMsg('Kunne ikke aktivere emisjonen');
            }
          }}
          onFinalize={async () => {
            setEmissionToFinalize(detailsTarget);
            setShowFinalizeModal(true);
          }}
        />
      )}

      {showFinalizeModal && emissionToFinalize && (
        <ConfirmationModal
          isOpen={showFinalizeModal}
          title="Fullfør emisjon"
          description="Er du sikker på at du vil fullføre og finalisere denne emisjonen?"
          confirmText="Finaliser"
          onCancel={() => { setShowFinalizeModal(false); setEmissionToFinalize(null); }}
          onConfirm={async () => {
            try {
              // Bruk eksisterende finalize-kall fra services
              await emissionsService.finalizeEmission(emissionToFinalize.id);
              setShowFinalizeModal(false);
              setEmissionToFinalize(null);
              setSuccessMsg('Emisjonen ble finalisert');
              load();
            } catch (e: any) {
              setSuccessMsg('Kunne ikke finalisere emisjonen');
            }
          }}
        />
      )}

      <SuccessDialog
        open={!!successMsg}
        onOpenChange={(o) => !o && setSuccessMsg(null)}
        message={successMsg || ''}
      />
    </PageLayout>
  );
}