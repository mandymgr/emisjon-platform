import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import PageLayout from '@/components/layout/PageLayout';
import { getAllSnapshots } from '@/services/snapshotService';
import { getAllEmissions } from '../../services/emissionsService';
import type { Emission, ShareholderSnapshot } from '@/types/emission';
import {
  Camera,
  Calendar,
  Users,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  UserX,
  Loader2,
  Plus,
  Eye,
  RefreshCw,
  GitBranch,
  Clock
} from 'lucide-react';

interface SnapshotStats {
  totalSnapshots: number;
  recentSnapshots: number;
  totalShareholders: number;
  avgShareholding: number;
}

interface EnhancedSnapshot extends ShareholderSnapshot {
  emissionId: string;
  emissionTitle: string;
  totalShareholders: number;
  avgSharesPerHolder: number;
  largestHolding: number;
  reason: string;
  status: string;
}

const MinimalShareholderSnapshotsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState<EnhancedSnapshot[]>([]);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [stats, setStats] = useState<SnapshotStats | null>(null);
  const [selectedEmission, setSelectedEmission] = useState<string>('all');

  // Check access - Admin Level 2+ required for snapshots
  const hasAccess = user && user.role === 'ADMIN' && user.level >= 2;

  useEffect(() => {
    if (!hasAccess) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [, emissionsData] = await Promise.all([
          getAllSnapshots(),
          getAllEmissions()
        ]);

        // Mock enhanced snapshots data
        const enhancedSnapshots = Array.from({ length: 8 }, (_, index) => ({
          id: `snapshot-${index + 1}`,
          emissionId: emissionsData[Math.floor(Math.random() * Math.min(emissionsData.length, 3))]?.id || `emission-${index + 1}`,
          emissionTitle: `Emission ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
          type: ['AUTO', 'MANUAL'][Math.floor(Math.random() * 2)],
          totalShareholders: Math.floor(Math.random() * 100) + 20,
          totalShares: Math.floor(Math.random() * 50000) + 10000,
          avgSharesPerHolder: Math.floor(Math.random() * 1000) + 100,
          largestHolding: Math.floor(Math.random() * 5000) + 1000,
          createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
          reason: index % 3 === 0 ? 'Manual snapshot for audit' : 'Automatic snapshot before emission',
          status: ['COMPLETED', 'PROCESSING', 'FAILED'][Math.floor(Math.random() * 3)]
        }));

        setSnapshots(enhancedSnapshots);
        setEmissions(emissionsData);

        // Calculate stats
        const completed = enhancedSnapshots.filter(s => s.status === 'COMPLETED');
        const recentCount = enhancedSnapshots.filter(s =>
          new Date(s.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        setStats({
          totalSnapshots: enhancedSnapshots.length,
          recentSnapshots: recentCount,
          totalShareholders: completed.reduce((sum, s) => sum + s.totalShareholders, 0) / Math.max(completed.length, 1),
          avgShareholding: completed.reduce((sum, s) => sum + s.avgSharesPerHolder, 0) / Math.max(completed.length, 1)
        });
      } catch (error) {
        console.error('Error fetching snapshots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasAccess]);

  const filteredSnapshots = selectedEmission === 'all'
    ? snapshots
    : snapshots.filter(s => s.emissionId === selectedEmission);

  if (!hasAccess) {
    return (
      <PageLayout
        title="Tilgang nektet"
        subtitle="Du har ikke tilstrekkelig tilgang til denne siden"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-soft">
            <UserX className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-teal-900 mb-3">Admin Level 2+ påkrevd</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Aksjonærøyeblikksbilder krever Admin-rettigheter med Level 2+ tilgang. Kontakt din administrator for tilgang.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Øyeblikksbilder"
        subtitle="Laster aksjonærdata..."
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'AUTO' ? <Clock className="h-4 w-4" /> : <Camera className="h-4 w-4" />;
  };

  return (
    <PageLayout
      title="Aksjonærbilder"
      subtitle="Øyeblikksbilder av aksjonærstrukturen på ulike tidspunkt"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <Camera className="h-8 w-8 text-neutral-600" />
            <h1 className="text-4xl font-light text-neutral-900">
              Shareholder Snapshots
            </h1>
          </div>
          <p className="text-neutral-600">
            Track and manage historical shareholder data across emissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 bg-neutral-900 text-white text-sm font-light hover:bg-neutral-800 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Create Snapshot</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <Camera className="h-6 w-6 text-neutral-600" />
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Total Snapshots</p>
          <p className="text-3xl font-light text-neutral-900">
            {stats?.totalSnapshots || 0}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <Activity className="h-6 w-6 text-neutral-600" />
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Recent (30 days)</p>
          <p className="text-3xl font-light text-neutral-900">
            {stats?.recentSnapshots || 0}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <Users className="h-6 w-6 text-neutral-600" />
            <ArrowDownRight className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Avg. Shareholders</p>
          <p className="text-3xl font-light text-neutral-900">
            {Math.floor(stats?.totalShareholders || 0)}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <BarChart3 className="h-6 w-6 text-neutral-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Avg. Holding</p>
          <p className="text-3xl font-light text-neutral-900">
            {Math.floor(stats?.avgShareholding || 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm text-neutral-600">Filter by emission:</label>
            <select
              value={selectedEmission}
              onChange={(e) => setSelectedEmission(e.target.value)}
              className="px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
            >
              <option value="all">All Emissions</option>
              {emissions.map((emission: Emission) => (
                <option key={emission.id} value={emission.id}>
                  {emission.title || `Emission ${emission.id}`}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-neutral-600">
            {filteredSnapshots.length} snapshots
          </span>
        </div>
      </div>

      {/* Snapshots Grid - Gallery Style */}
      <div className="bg-white border border-neutral-200">
        <div className="p-8 border-b border-neutral-200">
          <h2 className="text-xl font-light text-neutral-900">Historical Snapshots</h2>
        </div>

        <div className="p-8">
          {filteredSnapshots.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredSnapshots.map((snapshot: EnhancedSnapshot) => (
                <div key={snapshot.id} className="border border-neutral-200 hover:border-neutral-400 transition-colors">
                  {/* Header */}
                  <div className="p-6 border-b border-neutral-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">
                          {snapshot.emissionTitle}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          {getTypeIcon(snapshot.type)}
                          <span className="capitalize">{snapshot.type.toLowerCase()} Snapshot</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(snapshot.status)}`}>
                        {snapshot.status}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600">Shareholders</p>
                        <p className="font-medium text-neutral-900">
                          {snapshot.totalShareholders.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Total Shares</p>
                        <p className="font-medium text-neutral-900">
                          {snapshot.totalShares.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Avg. per Holder</p>
                        <p className="font-medium text-neutral-900">
                          {snapshot.avgSharesPerHolder.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Largest Holding</p>
                        <p className="font-medium text-neutral-900">
                          {snapshot.largestHolding.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {snapshot.reason && (
                      <div className="pt-4 border-t border-neutral-100">
                        <p className="text-xs text-neutral-500 line-clamp-2">
                          {snapshot.reason}
                        </p>
                      </div>
                    )}

                    {/* Date */}
                    <div className="pt-4 border-t border-neutral-100">
                      <div className="flex items-center space-x-2 text-xs text-neutral-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Created: {new Date(snapshot.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors flex items-center justify-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>View Details</span>
                      </button>
                      <button className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors flex items-center justify-center space-x-1">
                        <GitBranch className="h-3 w-3" />
                        <span>Compare</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Camera className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-xl font-light text-neutral-900 mb-3">No Snapshots Found</h3>
              <p className="text-neutral-600 mb-6">
                {selectedEmission === 'all'
                  ? 'Create your first shareholder snapshot to track ownership data'
                  : 'No snapshots found for the selected emission'
                }
              </p>
              <div className="flex items-center justify-center space-x-3">
                {selectedEmission !== 'all' && (
                  <button
                    onClick={() => setSelectedEmission('all')}
                    className="px-6 py-3 border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                  >
                    View All Snapshots
                  </button>
                )}
                <button className="px-6 py-3 bg-neutral-900 text-white text-sm font-light hover:bg-neutral-800 transition-colors">
                  Create Snapshot
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MinimalShareholderSnapshotsPage;