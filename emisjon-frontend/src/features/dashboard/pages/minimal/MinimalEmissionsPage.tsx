import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getAllEmissions } from '../../services/emissionsService';
import PageLayout from '@/components/layout/PageLayout';
import type { Emission } from '@/types/emission';
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
  Activity
} from 'lucide-react';

interface EmissionStats {
  totalEmissions: number;
  activeEmissions: number;
  totalValue: number;
  totalSubscriptions: number;
}

interface EnhancedEmission extends Emission {
  subscriptions: number;
  sharesAvailable?: number;
}

const MinimalEmissionsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [emissions, setEmissions] = useState<EnhancedEmission[]>([]);
  const [stats, setStats] = useState<EmissionStats | null>(null);

  // Check access - Level 3+ required for emissions
  const hasAccess = user && (user.role === 'ADMIN' || user.level >= 3);

  useEffect(() => {
    if (!hasAccess) return;

    const fetchEmissions = async () => {
      try {
        setLoading(true);
        const emissionsData = await getAllEmissions();

        // Mock enhanced data for demo
        const enhancedEmissions = emissionsData.map((emission: Emission): EnhancedEmission => ({
          ...emission,
          subscriptions: Math.floor(Math.random() * 50) + 10,
          totalValue: Math.floor(Math.random() * 5000000) + 1000000,
          status: (['PREVIEW', 'ACTIVE', 'COMPLETED', 'FINALIZED'] as const)[Math.floor(Math.random() * 4)],
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
          sharesAvailable: Math.floor(Math.random() * 100000) + 50000
        }));

        setEmissions(enhancedEmissions);

        // Calculate stats
        setStats({
          totalEmissions: enhancedEmissions.length,
          activeEmissions: enhancedEmissions.filter((e: EnhancedEmission) => e.status === 'ACTIVE').length,
          totalValue: enhancedEmissions.reduce((sum: number, e: EnhancedEmission) => sum + (e.totalValue || 0), 0),
          totalSubscriptions: enhancedEmissions.reduce((sum: number, e: EnhancedEmission) => sum + e.subscriptions, 0)
        });
      } catch (error) {
        console.error('Error fetching emissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmissions();
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <PageLayout
        title="Emisjoner"
        subtitle="Tilgang nektet"
      >
        <div className="bg-white border border-gray-200 p-12 text-center rounded-2xl shadow-soft">
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-teal-900 mb-3">Nivå 3+ tilgang kreves</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Emisjonsadministrasjon krever Nivå 3+ tilgang eller adminrettigheter. Kontakt administrator for tilgang.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Emisjoner"
        subtitle="Laster emisjoner..."
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

  const actions = (
    <button className="bg-teal-700 hover:bg-teal-900 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors">
      <Plus className="h-4 w-4" />
      <span>Ny emisjon</span>
    </button>
  );

  return (
    <PageLayout
      title="Emisjoner"
      subtitle={`Administrer selskapsemisjoner og kapitalinnhenting (${emissions.length} emisjoner)`}
      actions={actions}
    >
      {/* Stats Oversikt */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 p-3 rounded-xl">
              <Activity className="h-5 w-5 text-teal-700" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Totale emisjoner</p>
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
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Aktive</p>
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
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total verdi</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.totalValue ? Math.floor(stats.totalValue / 1000000) : 0}M kr
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Users className="h-5 w-5 text-purple-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Tegninger</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.totalSubscriptions || 0}
          </p>
        </div>
      </div>

      {/* Emisjoner Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif text-teal-900">Aksjemisjoner</h2>
        </div>

        <div className="p-6">
          {emissions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {emissions.map((emission) => (
                <div key={emission.id} className="border border-gray-200 hover:border-teal-200 hover:shadow-soft transition-all rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                        {emission.title}
                      </h3>
                      <div className={`px-3 py-1 text-xs font-medium rounded-full ml-3 flex-shrink-0 ${getStatusColor(emission.status)}`}>
                        {emission.status}
                      </div>
                    </div>

                    {emission.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {emission.description}
                      </p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Aksjer tilgjengelig</p>
                        <p className="font-medium text-gray-900">
                          {emission.sharesAvailable?.toLocaleString('nb-NO') || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pris per aksje</p>
                        <p className="font-medium text-gray-900">
                          {emission.pricePerShare?.toFixed(2) || 'N/A'} kr
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tegninger</p>
                        <p className="font-medium text-gray-900">
                          {emission.subscriptions}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total verdi</p>
                        <p className="font-medium text-gray-900">
                          {Math.floor((emission.totalValue || 0) / 1000)}K kr
                        </p>
                      </div>
                    </div>

                    {/* Datoer */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(emission.startDate).toLocaleDateString('nb-NO')} - {' '}
                          {new Date(emission.endDate).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Handlinger */}
                  <div className="p-6 pt-0">
                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 border border-gray-300 text-sm text-gray-600 hover:text-teal-700 hover:border-teal-300 transition-colors flex items-center justify-center space-x-1 rounded-lg">
                        <Eye className="h-3 w-3" />
                        <span>Vis</span>
                      </button>
                      <button className="flex-1 py-2 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors flex items-center justify-center space-x-1 rounded-lg">
                        <Users className="h-3 w-3" />
                        <span>Tegn</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-serif text-teal-900 mb-3">Ingen emisjoner ennå</h3>
              <p className="text-gray-600 mb-6">
                Opprett din første aksjeemisjon for å starte kapitalinnhenting
              </p>
              <button className="px-6 py-3 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors rounded-xl">
                Opprett emisjon
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MinimalEmissionsPage;