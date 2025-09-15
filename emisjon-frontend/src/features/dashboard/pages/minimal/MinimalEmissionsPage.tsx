import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import * as emissionsService from '../../services/emissionsService';
import PageLayout from '@/components/layout/PageLayout';
import type { Emission } from '@/types/emission';
import AddEmissionModal from '../../components/AddEmissionModal';
import EditEmissionModal from '../../components/EditEmissionModal';
import DeleteEmissionModal from '../../components/DeleteEmissionModal';
import SubscribeModal from '@/components/emission/SubscribeModal';
import EmissionDetailsModal from '@/components/emission/EmissionDetailsModal';
import SuccessDialog from '@/components/ui/SuccessDialog';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { getTextPreview } from '@/utils/htmlUtils';
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  UserX,
  Loader2,
  Plus,
  Eye,
  Activity,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';

interface EmissionStats {
  totalEmissions: number;
  activeEmissions: number;
  totalValue: number;
  totalSubscriptions: number;
}

const MinimalEmissionsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [stats, setStats] = useState<EmissionStats | null>(null);

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

  // Check access - Level 3+ required for emissions OR admin role (admin always has access)
  const hasAccess = user && (user.role === 'ADMIN' || user.level >= 3);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!hasAccess) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await emissionsService.getAllEmissions();
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        // Ensure description doesn't break cards
        const withPreview = list.map((e: Emission) => ({
          ...e,
          description: e.description ? getTextPreview(e.description, 220) : '',
        }));
        setEmissions(withPreview);

        // Calculate stats from real data
        const activeCount = withPreview.filter((e: Emission) =>
          e.status === 'ACTIVE' || e.status === 'PREVIEW'
        ).length;

        const totalValue = withPreview.reduce((sum: number, e: Emission) => {
          const shares = typeof e.sharesAvailable === 'number' ? e.sharesAvailable : 0;
          const price = typeof e.pricePerShare === 'number' ? e.pricePerShare : 0;
          const value = shares * price;
          return sum + value;
        }, 0);

        setStats({
          totalEmissions: withPreview.length,
          activeEmissions: activeCount,
          totalValue: totalValue,
          totalSubscriptions: 0 // This would need subscription data
        });
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Could not fetch emissions');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <PageLayout
        title="Emissions"
        subtitle="Access denied"
      >
        <div className="bg-white border border-gray-200 p-12 text-center rounded-2xl shadow-soft">
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-teal-900 mb-3">Level 3+ Access Required</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Emission management requires Level 3+ access or admin privileges. Admins always have access regardless of level.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Emissions"
        subtitle="Loading emissions..."
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PREVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'FINALIZED': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const actions = isAdmin ? (
    <button
      onClick={() => setShowAdd(true)}
      className="bg-teal-700 hover:bg-teal-900 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
    >
      <Plus className="h-4 w-4" />
      <span>New Emission</span>
    </button>
  ) : null;

  return (
    <PageLayout
      title="Emissions"
      subtitle={`Manage company emissions and capital raising (${emissions.length} emissions)`}
      actions={actions}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 p-3 rounded-xl">
              <Activity className="h-5 w-5 text-teal-700" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Emissions</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.totalEmissions || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <TrendingUp className="h-5 w-5 text-blue-700" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Active</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.activeEmissions || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
            <ArrowDownRight className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Value</p>
          <p className="text-3xl font-serif text-teal-900">
            {formatCurrency(stats?.totalValue || 0)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Users className="h-5 w-5 text-purple-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Subscriptions</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.totalSubscriptions || 0}
          </p>
        </div>
      </div>

      {/* Emissions Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif text-teal-900">Share Emissions</h2>
        </div>

        {emissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares Available
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price per Share
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {emissions.map((emission) => {
                  const shares = typeof emission.sharesAvailable === 'number' ? emission.sharesAvailable : 0;
                  const price = typeof emission.pricePerShare === 'number' ? emission.pricePerShare : 0;
                  const totalValue = shares * price;

                  return (
                    <tr key={emission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {emission.title}
                          </div>
                          {emission.description && (
                            <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                              {emission.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(emission.status)}`}>
                          {emission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {emission.sharesAvailable?.toLocaleString() || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${typeof emission.pricePerShare === 'number' ? emission.pricePerShare.toFixed(2) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(totalValue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>
                            {emission.startDate ? new Date(emission.startDate).toLocaleDateString() : '—'}
                            {' - '}
                            {emission.endDate ? new Date(emission.endDate).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setDetailsTarget(emission)}
                            className="text-gray-600 hover:text-teal-700 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {emission.documents && emission.documents.length > 0 && (
                            <button
                              onClick={() => setDetailsTarget(emission)}
                              className="text-gray-600 hover:text-teal-700 transition-colors"
                              title="View documents"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => setEditTarget(emission)}
                                className="text-gray-600 hover:text-teal-700 transition-colors"
                                title="Edit emission"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(emission)}
                                className="text-gray-600 hover:text-red-600 transition-colors"
                                title="Delete emission"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {emission.status === 'ACTIVE' && (
                            <button
                              onClick={() => setSubscribeTarget(emission)}
                              className="px-3 py-1 bg-teal-700 text-white text-xs hover:bg-teal-800 transition-colors rounded-lg"
                            >
                              Subscribe
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-serif text-teal-900 mb-3">No emissions yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first share emission to start capital raising
            </p>
            {isAdmin && (
              <button className="px-6 py-3 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors rounded-xl">
                Create Emission
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddEmissionModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            setSuccessMsg('Emission created successfully');
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
            setSuccessMsg('Emission updated successfully');
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
              setSuccessMsg('Emission deleted successfully');
              load();
            } catch (e: any) {
              setSuccessMsg('Could not delete emission');
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
            setSuccessMsg('Subscription submitted for review');
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
            setDetailsTarget(null);
            load();
          }}
          onEdit={isAdmin ? () => setEditTarget(detailsTarget!) : undefined}
          onDelete={isAdmin ? () => setDeleteTarget(detailsTarget!) : undefined}
          onFinalize={isAdmin ? () => {
            setEmissionToFinalize(detailsTarget!);
            setShowFinalizeModal(true);
          } : undefined}
        />
      )}

      {showFinalizeModal && emissionToFinalize && (
        <ConfirmationModal
          isOpen={showFinalizeModal}
          title="Finalize Emission"
          message={`Are you sure you want to finalize "${emissionToFinalize.title}"? This action cannot be undone.`}
          confirmLabel="Finalize"
          onConfirm={async () => {
            try {
              await emissionsService.finalizeEmission(emissionToFinalize.id);
              setShowFinalizeModal(false);
              setEmissionToFinalize(null);
              setSuccessMsg('Emission finalized successfully');
              load();
            } catch (e: any) {
              setSuccessMsg('Could not finalize emission');
            }
          }}
          onCancel={() => {
            setShowFinalizeModal(false);
            setEmissionToFinalize(null);
          }}
        />
      )}

      {successMsg && (
        <SuccessDialog
          isOpen={!!successMsg}
          title="Success"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
    </PageLayout>
  );
};

export default MinimalEmissionsPage;